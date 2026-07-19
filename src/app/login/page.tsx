import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  const demoAvailable = Boolean(process.env.DEMO_DATABASE_URL);
  return <LoginForm demoAvailable={demoAvailable} />;
}
