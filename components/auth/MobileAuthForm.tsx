import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useTheme } from "@/common/providers/ThemeProvider";
import { Mail, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MOBILE_ROUTES } from "@/mobile/routes/mobileRoutes";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().default(false),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: "You must accept the terms and conditions.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function MobileAuthForm() {
  const { signIn, signUp, resetPassword, loginWithBiometrics } = useUnifiedAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
    signupForm.setValue("password", password);
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn(values.email, values.password, values.rememberMe);
      // Note: The actual navigation happens in the AuthContext's onAuthStateChange handler
      // which will redirect to dashboard upon successful login
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred during login.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signUp(values.email, values.password);
      // For signup, show a success message then switch to login mode
      setError("Account created successfully! Please check your email for verification.");
      // Switch to login mode after a delay
      setTimeout(() => {
        setError(null);
        setMode("login");
      }, 3000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred during sign up.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await resetPassword(values.email);
      // Show success message
      setError("Reset link sent! Please check your email.");
      // After sending reset email, show login form after a delay
      setTimeout(() => {
        setError(null);
        setMode("login");
      }, 3000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred while sending the reset link.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for biometrics
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  
  useEffect(() => {
     // Dynamic import or check to avoid web issues? 
     // biometricService is safe (has Platform checks inside exports if implemented correctly, but imports might be tricky on web if modules missing)
     // Assuming native environment for now as this is MobileAuthForm
     const checkBio = async () => {
         try {
             const { checkBiometricSupport, hasStoredCredentials } = await import("@/services/security/biometricService");
             const supported = await checkBiometricSupport();
             const hasCreds = await hasStoredCredentials();
             console.log("MobileAuthForm: Biometric Support:", supported, "Has Creds:", hasCreds);
             setCanUseBiometrics(supported && hasCreds);
         } catch (e) {
             console.log("Biometric check failed (web?)", e);
         }
     };
     checkBio();
  }, []);

  const handleBiometricLogin = async () => {
      // We need to cast useAuth to any or check interface because we just added loginWithBiometrics to UnifiedAuthContext
      // But useAuth here is imported from @/contexts/AuthContext?
      // Wait. The form uses `useAuth`. I modified `UnifiedAuthContext`.
      // I need to fix the import first.
  };

  return (
    <div className="w-full">


      {mode === "forgot" ? (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold">Reset Password</h2>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2 text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        className={`h-10 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-emerald hover:bg-emerald/90 text-black h-10 rounded-md"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode("login")}
                  className="h-10"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <Tabs
          defaultValue="login"
          value={mode}
          onValueChange={(value) => setMode(value as "login" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 h-auto p-0.5 bg-transparent">
            <TabsTrigger 
              value="login" 
              className={`${
                mode === 'login' 
                  ? 'text-emerald border-b-2 border-emerald' 
                  : `border-b-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`
              } rounded-none text-sm py-2 h-auto`}
            >
              Log in
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className={`${
                mode === 'signup' 
                  ? 'text-emerald border-b-2 border-emerald' 
                  : `border-b-2 ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`
              } rounded-none text-sm py-2 h-auto`}
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4 py-2 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="login" className="space-y-4 mt-0">
            {canUseBiometrics && (
                 <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                      setIsSubmitting(true);
                      await loginWithBiometrics();
                      setIsSubmitting(false);
                  }}
                  className="w-full h-10 rounded-md border-emerald text-emerald hover:bg-emerald/10 mb-4 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">Face ID</span> Log in with FaceID
                </Button>
            )}
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          className={`h-10 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm">Password</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => setMode("forgot")}
                          className="p-0 h-auto text-xs text-emerald"
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className={`h-10 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="flex items-center space-x-2">
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            id="remember-me"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-emerald data-[state=checked]:border-emerald"
                          />
                        </FormControl>
                        <label
                          htmlFor="remember-me"
                          className="text-xs font-medium leading-none cursor-pointer"
                        >
                          Remember me
                        </label>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald hover:bg-emerald/90 text-black h-10 rounded-md"
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                  OR CONTINUE WITH
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
            <Button 
                variant="outline" 
                type="button" 
                disabled={isSubmitting} 
                className={`h-10 text-xs ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-md`}
              >
                <Mail className="h-4 w-4 mr-2" /> Google
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                disabled={isSubmitting} 
                className={`h-10 text-xs ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-md`}
              >
                <Apple className="h-4 w-4 mr-2" /> Apple
              </Button>
                              
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4 mt-0">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          className={`h-10 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className={`h-10 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                          {...field}
                          onChange={handlePasswordChange}
                        />
                      </FormControl>
                      {field.value && (
                        <div className="mt-1">
                          <div className="flex space-x-1 h-1 mb-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={cn("flex-1 rounded-full", {
                                  "bg-red-500": passwordStrength >= 1 && i === 1,
                                  "bg-orange-500":
                                    passwordStrength >= 2 && i === 2,
                                  "bg-yellow-500":
                                    passwordStrength >= 3 && i === 3,
                                  "bg-emerald/70": passwordStrength >= 4 && i === 4,
                                  "bg-emerald": passwordStrength >= 5 && i === 5,
                                  [`${isDark ? 'bg-gray-700' : 'bg-gray-200'}`]:
                                    passwordStrength < i,
                                })}
                              ></div>
                            ))}
                          </div>
                          <p className={`text-2xs ${
                            passwordStrength <= 1
                              ? "text-red-500"
                              : passwordStrength <= 2
                              ? "text-orange-500"
                              : passwordStrength <= 3
                              ? "text-yellow-500"
                              : passwordStrength <= 4
                              ? "text-emerald/70"
                              : "text-emerald"
                          }`}>
                            {passwordStrength <= 1
                              ? "Very Weak"
                              : passwordStrength === 2
                              ? "Weak"
                              : passwordStrength === 3
                              ? "Medium"
                              : passwordStrength === 4
                              ? "Strong"
                              : "Very Strong"}
                          </p>
                        </div>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className={`h-10 text-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="accept-terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-emerald data-[state=checked]:border-emerald mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <label
                          htmlFor="accept-terms"
                          className="text-xs font-medium cursor-pointer"
                        >
                          I accept the terms and conditions
                        </label>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          By signing up, you agree to our{" "}
                          <a href="#" className="underline text-emerald">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="underline text-emerald">
                            Privacy Policy
                          </a>
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald hover:bg-emerald/90 text-black h-10 rounded-md"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                  OR SIGN UP WITH
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                type="button" 
                disabled={isSubmitting} 
                className={`h-10 text-xs ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-md`}
              >
                <Apple className="h-4 w-4 mr-2" /> Apple
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                disabled={isSubmitting} 
                className={`h-10 text-xs ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-md`}
              >
                <Mail className="h-4 w-4 mr-2" /> Email
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}