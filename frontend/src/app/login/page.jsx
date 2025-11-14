import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full ">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Section - Shows on top for mobile, left for desktop */}
        <div className="col-span-1 flex items-center justify-center bg-slate-600 min-h-[200px] lg:min-h-screen">
          <div className="text-white text-4xl font-bold">Your Logo</div>
        </div>

        {/* Right Section */}
        <div className="col-span-1 relative flex flex-col items-center justify-center space-y-4 px-4 py-8 lg:py-0">
          {/* Header */}

                <div className=" absolute top-10 right-10">Login</div>
 
          <div className="flex flex-col space-y-1 text-center">
            <div className="text-3xl font-sans text-primary">Create an account</div>
            <div className="text-foreground font-sans text-[15px]">
              Enter your email below to create your account
            </div>
          </div>

          {/* Input & Button */}
          <div className="flex flex-col space-y-4 items-center justify-center w-full max-w-sm">
            <Input type="email" placeholder="Email" className="w-full h-10" />
            <Button className="w-full text-[15px] font-sans h-10">Create Account</Button>
          </div>

          {/* Divider with text */}
          <div className="flex items-center w-full max-w-sm">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-foreground text-[15px]">Or continue with</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col space-y-2 w-full max-w-sm">
            <Button variant="outline" className="w-full h-10 flex items-center justify-center space-x-2">
              <Image 
                src="/assert/auth/google.svg" 
                alt="Google Logo" 
                width={16} 
                height={16}
              />
              <span>Google</span>
            </Button>
            <Button variant="outline" className="w-full h-10 flex items-center justify-center space-x-2">
              <Image 
                src="assert/auth/github.svg" 
                alt="GitHub Logo" 
                width={16} 
                height={16}
              />
              <span>GitHub</span>
            </Button>
          </div>

          {/* Terms Text */}
          <div className="text-xs text-gray-500 text-center w-full max-w-sm mt-4">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}