declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    DIRECT_URL: string;
    JWT_SECRET: string;
    RESEND_API_KEY: string;
    NEXT_PUBLIC_APP_URL: string;
    EMAIL_FROM: string;
    STRIPE_SECRET_KEY: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
    NEXT_PUBLIC_CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    GEMINI_API_KEY: string;
    GEMINI_MODEL: string;
  }
}
