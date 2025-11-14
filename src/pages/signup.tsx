import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import z from "zod";

const schema = z.object({
  phone: z.string().min(1, "Phone is requied"),
  password: z.string().min(1, "Password is requied"),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const form = useForm({
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="bg-neutral-50 h-screen flex justify-center items-center"
    >
      <Card className="w-96 border-0 shadow-none">
        <CardHeader>
          <CardTitle>Đăng ký</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Field name="phone">
            {(field) => (
              <Field>
                <FieldLabel>Số điện thoại</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <Field>
                <FieldLabel>Mật khẩu</FieldLabel>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                />
              </Field>
            )}
          </form.Field>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" size="lg">
            Đăng ký
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
