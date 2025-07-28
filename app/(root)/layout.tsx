import { isAuthenticated } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const RootLayout = async ({children}: {children: ReactNode}) => {  
  const isUserAuthenticated = await isAuthenticated();

  if(!isUserAuthenticated) redirect('/sign-in');
  return (
    <div className="root-layout">
        <nav className="flex items-center justify-between mt-5 px-6">
            <Link href='/' className="flex items-center gap-2" >
                <Image src="/logo.svg" alt='logo' width={38} height={32} />
                <h2 className="text-primary-100">Prep AI</h2>
            </Link>
            <Link href='/profile' className="flex item-center gap-2">
                <Image src="profile.svg" alt='user' width={32} height={32} className="rounded-full aspect-square" />
            </Link>
        </nav>
        {children}
    </div>
  );
}
export default RootLayout;