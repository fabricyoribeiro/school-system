"client side"
import Image from "next/image";
import React, { ForwardedRef, useEffect, useState } from "react";
import { getUserFromToken } from "@/lib/getUserFromToken";

type ReportProps = {
  children?: React.ReactNode;
  title?: string;
};

const Report = React.forwardRef<HTMLDivElement, ReportProps>(({ children, title }, ref) => {
  const [user, setUser] = useState<any>(null);

  const now = new Date();
  const formattedDate = now.toLocaleDateString("pt-BR");
  const formattedTime = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const fetchedUser = getUserFromToken();
    setUser(fetchedUser);
  }, []);

  return (
    <div
      ref={ref}
      className="mx-0 w-[210mm] px-0 py-0"
    >
      <style>{`
        @media print {
          @page {
            margin: 5mm;
          }
        }
      `}</style>
      <div className="flex items-center gap-8">
        <Image src="/logo.png" width={150} height={0} alt="Logo" />
        <div className="text-[7px]">
          <p>CNPJ: 35.030.958/0001-00</p>
          <p>ENDEREÇO: Rua Enock Ignácio de Oliveira, 949 - Nossa Senhora da Penha - Serra Talhada - PE</p>
          <div className="flex justify-between">
            <p>TELEFONE: (87) 9 9983-1241</p>
            <p>EMAIL: escola@escola.COM</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[8px]">
        <div />
        <p className="whitespace-pre">{formattedDate}    |    {formattedTime}    |    {user ? user.name : ""}</p>
      </div>
      <div className="bg-gray-300 text-center font-semibold text-xs my-2">
        {title || "Relatório"}
      </div>

      {children}
    </div>
  );
});
Report.displayName = "Report";


export default Report;
