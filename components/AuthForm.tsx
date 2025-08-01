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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"



const authFormSchema = (type: FormType) => {
    return z.object({
        name: type == 'sign-up' ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6),
    })
}


const AuthForm = ({type}: {type:FormType}) => {
// 1. Define your form.
const router = useRouter();
const formSchema = authFormSchema(type);
const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email:"",
        password: "",
    },
  })
 
  // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if (type === 'sign-in') {
                const { email, password} = values;

                const userCredentials = await signInWithEmailAndPassword(auth,email,password);
                const idToken = await userCredentials.user.getIdToken();

                if(!idToken){
                    toast.error("Sign in Failed. Please try again")
                }
                await signIn({email,idToken});

                
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
                      password,  
                })

                if (!result?.success){
                    toast.error(result?.message);
                    return;
                }



                toast.success('Account created successfully. Please Sign in')
                router.push('/sign-in')
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong, please try again later.");
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
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} 
            className="w-full space-y-6 mt-4 form">
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

                <Button className="btn" type="submit">{isSignIn ? 'Sign in' : 'Create an Account'}</Button>
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