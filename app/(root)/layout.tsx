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
        <nav className="flex items-center justify-between mt-3 sm:mt-5 px-3 sm:px-6 py-2">
            <Link href='/' className="flex items-center gap-1 sm:gap-2" >
                <Image 
                  src="/logo.svg" 
                  alt='logo' 
                  width={32} 
                  height={28}
                  className="sm:w-[38px] sm:h-[32px]"
                />
                <h2 className="text-primary-100 text-lg sm:text-xl font-semibold">
                  Prep AI
                </h2>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href='/profile' className="flex items-center gap-1 sm:gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs sm:text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline-block text-sm text-gray-700">
                  Profile
                </span>
              </Link>
              
              <form action={signOut}>
                <button 
                  type="submit"
                  className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors font-medium"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
        </nav>
        
        <main className="px-3 sm:px-6 py-2 sm:py-4">
          {children}
        </main>
    </div>
  );
}

export default RootLayout;