const roomType = document.querySelector("#roomType");
const guests = document.querySelector("#guests");
const checkin = document.querySelector("#checkin");
const checkout = document.querySelector("#checkout");
const amount = document.querySelector("#amount");
const amountNote = document.querySelector("#amountNote");
const form = document.querySelector("#bookingForm");
const formStatus = document.querySelector("#formStatus");

const formatCurrency = (value) =>
  `Rs. ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value)}`;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNights = () => {
  const start = toDate(checkin.value);
  const end = toDate(checkout.value);
  if (!start || !end || end <= start) return 1;
  return Math.max(1, Math.round((end - start) / 86400000));
};

const getAmountDetails = () => {
  const nightlyRate = Number(roomType.value);
  const guestCount = Number(guests.value || 1);
  const nights = getNights();
  const extraGuestCharge = Math.max(0, guestCount - 2) * 700 * nights;
  const subtotal = nightlyRate * nights + extraGuestCharge;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + tax;

  return { nightlyRate, guestCount, nights, extraGuestCharge, subtotal, tax, total };
};

const updateAmount = () => {
  const details = getAmountDetails();
  amount.textContent = formatCurrency(details.total);
  amountNote.textContent = `${details.nights} night${details.nights === 1 ? "" : "s"}, ${details.guestCount} guest${details.guestCount === 1 ? "" : "s"}, tax included`;
};

const setInitialDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  checkin.value = toInputDate(today);
  checkout.value = toInputDate(tomorrow);
  checkin.min = toInputDate(today);
  checkout.min = toInputDate(tomorrow);
};

setInitialDates();
updateAmount();

[roomType, guests, checkin, checkout].forEach((field) => {
  field.addEventListener("input", () => {
    if (field === checkin) {
      const selected = toDate(checkin.value);
      if (selected) {
        const nextDay = new Date(selected);
        nextDay.setDate(selected.getDate() + 1);
        checkout.min = toInputDate(nextDay);
        if (toDate(checkout.value) <= selected) {
          checkout.value = checkout.min;
        }
      }
    }
    updateAmount();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const guestName = data.get("fullName") || "Guest";
  const paymentType = data.get("paymentType");
  formStatus.textContent = `Thank you, ${guestName}. Your booking request is ready for hotel confirmation with ${paymentType} payment.`;
});
