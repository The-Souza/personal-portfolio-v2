/** A WhatsApp chat link (wa.me), with an optional prefilled message. */
export function whatsappUrl(phone: string, message: string) {
  const url = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

/** A mailto link with an optional subject (encodeURIComponent, so spaces are %20, not +). */
export function mailtoUrl(email: string, subject: string) {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}
