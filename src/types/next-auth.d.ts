import type { AdminRole } from "@prisma/client";

// next-auth re-exports these User/Session/JWT types from @auth/core rather than
// declaring them itself, so augmentation has to target the @auth/core modules
// directly for the merge to apply.
declare module "@auth/core/types" {
  interface User {
    role: AdminRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: AdminRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: AdminRole;
  }
}
