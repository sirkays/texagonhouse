import React from "react";
import {PaymentHistory} from "@/components/parent/payment-history";
import {InvoiceList} from "@/components/invoice/invoice-list";

const ParentPaymentsMain = () => {
  return (
    <div>
      <InvoiceList />
    </div>
  );
};

export default ParentPaymentsMain;
