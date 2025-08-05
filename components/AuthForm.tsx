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
      
      // Check if this is a new user (first time with Google)
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
      
      if (isNewUser) {
        // New user - create in database
        const result = await signUp({
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email!,
        });

        if (!result?.success && !result?.message.includes("already exists")) {
          toast.error(result?.message || "Failed to create account");
          return;
        }
        
        toast.success('Welcome! Account created successfully with Google.');
      } else {
        // Existing user
        toast.success('Welcome back! Signed in successfully.');
      }
      
      // Always sign in and redirect to home for Google auth (both new and existing users)
      await signIn({ email: user.email!, idToken });
      router.push('/');
      
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
           <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
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
