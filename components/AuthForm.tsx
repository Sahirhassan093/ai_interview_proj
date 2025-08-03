"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { ca } from "zod/v4/locales"
import { toast } from "sonner"
import FormField from "@/components/FormField"
import { useRouter } from "next/navigation"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { useState } from "react"

const authFormSchema = (type: FormType) => {
    return z.object({
        name: type == 'sign-up' ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6),
    })
}

const AuthForm = ({type}: {type:FormType}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email:"",
      password: "",
    },
  })

  // Google Sign-in handler
  async function handleGoogleAuth() {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredentials = await signInWithPopup(auth, provider);
      const idToken = await userCredentials.user.getIdToken();
      
      if (!idToken) {
        toast.error("Google authentication failed. Please try again");
        return;
      }

      const user = userCredentials.user;
      
      if (type === 'sign-up') {
        // For sign-up, create user in database
        const result = await signUp({
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email!,
        });

        if (!result?.success) {
          if (result?.message.includes("already exists")) {
            // User already exists, just sign them in
            await signIn({ email: user.email!, idToken });
            toast.success('Welcome back! Signed in successfully.');
            router.push('/');
          } else {
            toast.error(result?.message);
          }
          return;
        }

        toast.success('Account created successfully with Google!');
        // After successful signup, sign them in
        await signIn({ email: user.email!, idToken });
        router.push('/');
      } else {
        // For sign-in, just authenticate
        const result = await signIn({ email: user.email!, idToken });
        
        // Check if signIn was successful (you'll need to update your signIn function to return success)
        toast.success('Signed in successfully with Google!');
        router.push('/');
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup blocked. Please allow popups and try again");
      } else {
        toast.error("Google authentication failed. Please try again");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }
 
  // Regular form submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try{
      if (type === 'sign-in') {
        const { email, password} = values;

        const userCredentials = await signInWithEmailAndPassword(auth,email,password);
        const idToken = await userCredentials.user.getIdToken();

        if(!idToken){
          toast.error("Sign in Failed. Please try again")
          return;
        }
        
        const result = await signIn({email,idToken});
        
        // You should update your signIn function to return success/failure
        toast.success('Sign in Successfully.')
        router.push('/')
      }
      else {
        const {name,email,password} =values;

        const userCredentials = await createUserWithEmailAndPassword(auth,email,password);

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
        })

        if (!result?.success){
          toast.error(result?.message);
          return;
        }

        toast.success('Account created successfully. Please Sign in')
        router.push('/sign-in')
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error("An account with this email already exists. Please sign in.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else {
        toast.error("Something went wrong, please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  const isSignIn = type === 'sign-in';
  
  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src='/logo.svg' alt="logo" width={33} height={32} />
          <h2 className="text-primary-100">
            Prep AI
          </h2>
        </div>
        <h3 className="flex flex-row gap-2 justify-center">Practise job interview with AI</h3>
        
        {/* Google Sign-in Button */}
        <Button 
          type="button"
          variant="outline" 
          className="w-full flex items-center gap-3 py-6"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading || isLoading}
        >
          <Image 
            src="/Google-logo.jpg" 
            alt="Google" 
            width={20} 
            height={20}
            className="rounded-full" 
          />
          {isGoogleLoading ? (
            "Loading..."
          ) : (
            `${isSignIn ? 'Sign in' : 'Sign up'} with Google`
          )}
        </Button>
        
        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} 
          className="w-full space-y-6 form">
            {!isSignIn && <FormField
              control={form.control}
              name="name"
              label="Name"
              placeholder="Your Full Name"
              type="text"
            />}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button 
              className="btn w-full" 
              type="submit"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Loading..." : (isSignIn ? 'Sign in' : 'Create an Account')}
            </Button>
          </form>
        </Form>
        
        <p className="text-center">
          {isSignIn ? "Don't have an account?" : 'Already have an account?'} 
          <Link href={!isSignIn ? '/sign-in' : '/sign-up'} 
          className="font-bold text-user-primary ml-1">
            {!isSignIn ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;