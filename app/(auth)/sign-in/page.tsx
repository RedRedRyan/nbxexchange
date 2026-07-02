"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import { useRouter } from "next/navigation";
import { magic } from "@/lib/auth.magic";
import { useAuthStore } from "@/store/auth.store";


type SignInFormData = {
    email: string;
};


const SignIn = () => {
    const router = useRouter();
    const fetchAuthenticatedUser = useAuthStore((s) => s.refreshSession);

    const [authError, setAuthError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: { email: "" },
        mode: "onBlur",
    });

    const onSubmit = async (data: SignInFormData) => {
        setAuthError(null);

        if (!magic) {
            setAuthError("Wallet SDK isn't ready yet. Please refresh and try again.");
            return;
        }

        try {
            await magic.auth.loginWithEmailOTP({ email: data.email });

            // Populate the Zustand store (userInfo, balance, isConnected)
            await fetchAuthenticatedUser();

            router.push("/dashboard");
        } catch (e) {
            console.error("Magic login error:", e);
            setAuthError("We couldn't log you in. Check the code and try again.");
        }
    };

    return (
        <>
            <h1 className="form-title">Get Started</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="name@example.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: "Email is required",
                        pattern: /^\w+@\w+\.\w+$/,
                    }}
                />

                {authError && (
                    <p className="text-sm text-red-500" role="alert">
                        {authError}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="orange-btn w-full mt-5"
                >
                    {isSubmitting ? "Sending link…" : "Log In / Sign Up"}
                </Button>


            </form>
        </>
    );
};

export default SignIn;