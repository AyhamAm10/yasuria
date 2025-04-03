export const sendSms = async (phone: string, message: string): Promise<void> => {
    try {
      console.log(`Sending SMS to ${phone}: ${message}`);
    } catch (error) {
      console.error("Failed to send SMS:", error);
      throw new Error("Failed to send SMS");
    }
  };
  