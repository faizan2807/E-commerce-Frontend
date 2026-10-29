// Utility to dynamically load external payment gateway scripts (Razorpay SDK)

export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(false);
            return;
        }

        // Check if already loaded in window
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true));
            existingScript.addEventListener("error", () => resolve(false));
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error("Failed to load Razorpay SDK");
            resolve(false);
        };

        document.body.appendChild(script);
    });
};
