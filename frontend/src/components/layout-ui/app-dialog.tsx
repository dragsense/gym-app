// React
import type { ReactNode } from "react";

// Custom UI Components
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


interface IDialogProps {
  title: string | ReactNode;
  description?: string;
  footerContent?: ReactNode;
  children: ReactNode;
}

export const AppDialog = ({
  title,
  description,
  footerContent,
  children,
}: IDialogProps) => {
  return (
    <>
        <DialogHeader>
          {typeof title === "string" ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            title
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {footerContent && (
          <DialogFooter className="mt-6">{footerContent}</DialogFooter>
        )}
      </>
  );
};
