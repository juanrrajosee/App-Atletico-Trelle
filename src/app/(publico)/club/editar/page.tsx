import type { Metadata } from "next";
import { exigirAdministrador } from "@/lib/auth";
import { cargarClub } from "../datos";
import { FormularioClub } from "../formulario-club";

export const metadata: Metadata = {
  title: "Editar el club",
};

export default async function PaginaEditarClub() {
  await exigirAdministrador();
  const club = await cargarClub();

  return (
    <div className="pagina-estrecha flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Historia y contacto
      </h1>
      <FormularioClub
        valoresIniciales={{
          historia_club: club.historia_club ?? "",
          historia_trelle: club.historia_trelle ?? "",
          telefono: club.telefono ?? "",
          email: club.email ?? "",
          campo: club.campo ?? "",
          titular_nombre: club.titular_nombre ?? "",
          titular_cif: club.titular_cif ?? "",
          titular_domicilio: club.titular_domicilio ?? "",
          email_privacidad: club.email_privacidad ?? "",
        }}
      />
    </div>
  );
}
