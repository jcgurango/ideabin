import { MouseEvent, useCallback, useState } from "react";
import { Button, ButtonProps } from "./button";
import { Loader2 } from "lucide-react";

export interface AsyncButtonProps {
  onClick(e: MouseEvent): Promise<any>;
  onError(e: any): void;
}

export default function AsyncButton({
  onClick,
  onError,
  disabled,
  children,
  ...props
}: ButtonProps & AsyncButtonProps) {
  const [loading, setLoading] = useState(false);

  const exec = useCallback(
    (e: MouseEvent) => {
      let cancelled = false;

      (async () => {
        try {
          setLoading(true);
          await onClick(e);
          setLoading(false);
        } catch (e) {
          onError(e);
        }
      })();

      return () => {
        cancelled = true;
        setLoading(false);
      };
    },
    [onClick]
  );

  return (
    <Button {...props} disabled={loading || disabled} onClick={exec}>
      {loading ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Button>
  );
}
