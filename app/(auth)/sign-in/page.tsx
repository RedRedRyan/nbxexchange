"use client";

import { useForm } from "react-hook-form";
import { Magic } from "magic-sdk";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import { useRouter } from "next/navigation";
import {HederaExtension} from "@magic-ext/hedera";

type SignInFormData = {
    email: string;
};

const magic =
    typeof window !== "undefined"
        ? new Magic("pk_live_0018166BD8A4181E", {
            extensions: [new HederaExtension({ network: "testnet" })],
        })
        : null;

const SignIn = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: { email: "" },
        mode: "onBlur",
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            // Magic sends a one-time link / OTP to the user's email.
            // The modal/OTP UI is handled automatically by the Magic SDK.
            const didToken = await magic!.auth.loginWithEmailOTP({
                email: data.email,
            });

            // didToken is a Decentralised ID token you can send to your
            // backend to verify the session if needed.
            console.log("DID Token:", didToken);

            // Optionally fetch the logged-in user's info
            const userMetadata = await magic!.user.getInfo();
            console.log("User:", userMetadata);

            router.push("/dashboard");
        } catch (e) {
            console.error("Magic login error:", e);
        }
    };

    return (
        <>
            <h1 className="form-title">Welcome back</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="contact@jsmastery.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: "Email is required",
                        pattern: /^\w+@\w+\.\w+$/,
                    }}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="orange-btn w-full mt-5"
                >
                    {isSubmitting ? "Sending link…" : "Sign In"}
                </Button>

                <FooterLink
                    text="Don't have an account?"
                    linkText="Create an account"
                    href="/sign-up"
                />
            </form>
        </>
    );
};

export default SignIn;