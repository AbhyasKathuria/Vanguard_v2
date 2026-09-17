import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DynamicDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/dashboard");
  }

  // Dynamic role-based routing based on User record
  if (user.role === "citizen") {
    if (user.citizenProfile === "farmer") {
      redirect("/farmer");
    }
    if (user.citizenProfile === "women") {
      redirect("/citizen/women");
    }
    redirect("/citizen/dashboard");
  }

  if (user.role === "worker") {
    redirect("/worker/dashboard");
  }

  if (user.role === "volunteer") {
    redirect("/volunteer/dashboard");
  }

  if (user.role === "authority" || (user.role as string) === "higher_authority") {
    redirect("/authority/dashboard");
  }

  if (user.role === "super_admin" || (user.role as string) === "admin") {
    if (
      user.id === "usr_higher_medical" ||
      user.phone === "9876543270" ||
      user.name?.toLowerCase().includes("dr.") ||
      user.location === "State Medical Directorate"
    ) {
      redirect("/higher-official/dashboard");
    }
    redirect("/superadmin/dashboard");
  }

  redirect("/citizen/dashboard");
}
