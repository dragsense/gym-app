import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { type TFormHandlerStore } from "@/stores";
import { type TVerifyOtpData } from "@shared/types/auth.type";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import { useFormContext, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/config/routes.config";
import { toast } from "sonner";
import { FormErrors } from "../shared-ui/form-errors";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { AppCard } from "../layout-ui/app-card";
import { Form } from "../form-ui/form";

export type TVerifyOtpExtraProps = {
    resendOtp: () => Promise<IMessageResponse>;
}

interface IVerifyOtpFormProps extends THandlerComponentProps<TFormHandlerStore<TVerifyOtpData, IMessageResponse, TVerifyOtpExtraProps>> {
}

export default function VerifyOtpForm({ storeKey, store }: IVerifyOtpFormProps) {

    const length = 6;

    if (!store) return `Form store "${storeKey}" not found.`;

    const isSubmitting = store(state => state.isSubmitting);
    const resendOtp = store(state => state.extra.resendOtp);
    const { control, setValue, getValues } = useFormContext<TVerifyOtpData>();

    const inputsRef = useRef<HTMLInputElement[]>([]);
    const [timeLeft, setTimeLeft] = useState(5 * 60);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        const values = getValues().code?.split("") || Array(6).fill("");
        if (e.key === "Backspace" && !values[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, ""); // only digits
        if (!pasteData) return;

        const values = getValues().code?.split("") || Array(length).fill("");
        for (let i = 0; i < length; i++) {
            values[i] = pasteData[i] || values[i];
        }
        setValue("code", values.join(""));

        const nextEmptyIndex = values.findIndex(v => !v);
        if (nextEmptyIndex !== -1) {
            inputsRef.current[nextEmptyIndex]?.focus();
        }
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const values = getValues().code?.split("") || Array(length).fill("");
        values[index] = value;
        setValue("code", values.join(""));

        if (value && index < length - 1) inputsRef.current[index + 1]?.focus();
    };


    const handleResend = async () => {
        if (!resendOtp) return;
        try {
            setResending(true);
            await resendOtp();
            setTimeLeft(5 * 60);
            toast.success("OTP resent successfully!");
        } catch (err: any) {
            toast.error("Failed to resend OTP: " + err.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <Form<TVerifyOtpData, IMessageResponse>
            formStore={store}
        >
            <AppCard
                header={
                    <>
                        <h2 className="text-md font-semibold">Verify OTP</h2>
                        <p className="text-sm text-muted-foreground">Enter the OTP sent to your email</p>
                    </>
                }
                footer={
                    <div className="flex flex-col gap-4 w-full">

                        <p className="text-center text-sm text-muted-foreground">
                            Your OTP will expire in{" "}
                            <span className="font-medium text-primary">
                                {minutes}:{seconds.toString().padStart(2, "0")}
                            </span>
                        </p>

                        <Controller
                            name="rememberDevice"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Checkbox id="rememberDevice" checked={field.value} onCheckedChange={field.onChange} />
                                    <label
                                        htmlFor="rememberDevice"
                                        className="text-sm text-muted-foreground cursor-pointer"
                                    >
                                        Remember this device
                                    </label>
                                </div>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting || resending}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify OTP
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleResend}
                            disabled={isSubmitting || resending}
                        >
                            {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {resending ? "Resending..." : "Resend OTP"}
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                <Link to={PUBLIC_ROUTES.LOGIN} className="text-primary hover:underline">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>
                }
            >
                <Controller
                    name="code"
                    control={control}
                    defaultValue={Array(length).fill("").join("")}
                    render={() => {
                        const codeValue = getValues("code") || "";
                        return (
                            <div className="flex justify-center gap-2 mt-4">
                                {Array.from({ length }).map((_, idx) => (
                                    <Input
                                        key={idx}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        className="w-12 h-12 text-center text-lg ring-1 ring-accent focus:ring-primary"
                                        value={codeValue[idx] || ""}
                                        onChange={(e) => handleChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        onPaste={handlePaste}
                                        ref={(el) => { inputsRef.current[idx] = el!; }}
                                    />
                                ))}
                            </div>
                        );
                    }}
                />

                <FormErrors />
            </AppCard>
        </Form>
    );
}
