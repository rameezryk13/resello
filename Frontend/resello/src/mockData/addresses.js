// Sample address book every new account starts with, so checkout has somewhere
// to ship on the first order instead of forcing the address form up front.
// Users can add their own; these were previously a shared module-level array in
// homePage.route.js, which meant one visitor's addresses were everyone's.

const defaultAddresses = [
  {
    name: "Home",
    line1: "House Abcd, Street A, Phase 5",
    line2: "Block B, Islamabad",
    city: "Islamabad",
    phone: "+92 300 1234567",
    phone2: "",
  },
  {
    name: "Office",
    line1: "Suite 23, Business Tower",
    line2: "F-8 Markaz, Islamabad",
    city: "Islamabad",
    phone: "+92 300 9876543",
    phone2: "",
  },
];

// Ids are namespaced per user: two accounts must never share an address id, or
// one user's POST /orders could reference the other's address.
const seedAddressesFor = (userId) =>
  defaultAddresses.map((address, index) => ({
    id: `${userId}-address-${index + 1}`,
    ...address,
  }));

export { defaultAddresses, seedAddressesFor };
export default defaultAddresses;
