export const cultureContact = {
  addressLine1: "Rua José de Anchieta, 82",
  addressLine2: "Boa Vista, Siqueira Campos/PR",
  email: "cultura@siqueiracampos.pr.gov.br",
  phones: ["(43) 3571-1122", "(43) 3571-1231", "(43) 3571-1262"],
  extensions: [
    { label: "Casa da Cultura", number: "606" },
    { label: "Biblioteca", number: "611" },
    { label: "Museu", number: "627" },
  ],
};

export function formatPhones() {
  return cultureContact.phones.join(" / ");
}
