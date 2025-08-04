import { getCurrentUser, isAuthenticated, signOut } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const RootLayout = async ({children}: {children: ReactNode}) => {
  const [isUserAuthenticated,user] = await Promise.all([
      await isAuthenticated(),
      await getCurrentUser(),
  ])  
  if(!isUserAuthenticated) redirect('/sign-in');
  return (
    <div className="root-layout">
        <nav className="flex items-center justify-between mt-5 px-6">
            <Link href='/' className="flex items-center gap-2" >
                <Image src="/logo.svg" alt='logo' width={38} height={32} />
                <h2 className="text-primary-100">Prep AI</h2>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href='/profile' className="flex item-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-black text-sm font-semibold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
            </Link>
            <form action={signOut}>
                  <button 
                    type="submit"
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
            </div>
        </nav>
        {children}
    </div>
  );
}
export default RootLayout;