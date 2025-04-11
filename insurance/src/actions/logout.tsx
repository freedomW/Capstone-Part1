import { signOut } from "@/auth";

export const logoutUser = async () => {
  try {
    await signOut({ redirect: false });
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error logging out user:", error);
  }
}
