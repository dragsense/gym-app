// React
import { type ReactNode } from "react";

// UI Components
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Store
import type { TFormHandlerStore } from "@/stores";

// Utility Function
import { cn } from "@/lib/utils";
import { Form } from "./form";


type TDialogWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";


const widthMap: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
};

interface IModalFormProps<TFormData, TResponse, TExtraProps extends Record<string, any> = {}> {
  className?: string;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  title: string;
  description?: string;
  footerContent?: ReactNode;
  children: ReactNode;
  width?: TDialogWidth;
  formStore: TFormHandlerStore<TFormData, TResponse, TExtraProps>;
}

export function ModalForm<TFormData, TResponse, TExtraProps extends Record<string, any> = {}>({
  open,
  onOpenChange,
  title,
  description,
  footerContent,
  children,
  width = "lg",
  formStore,
  className
}: IModalFormProps<TFormData, TResponse, TExtraProps>) {



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent forceMount
        className={cn(`max-h-[90vh] overflow-y-auto`, widthMap[width] || "sm:max-w-lg")}
      >
        <Form<TFormData, TResponse, TExtraProps>
          formStore={formStore}
          className={className}
        >
          <AppDialog
            title={title}
            description={description}
            footerContent={footerContent}
          >
            {children}

          </AppDialog>
        </Form>

      </DialogContent>
    </Dialog >
  );
}
