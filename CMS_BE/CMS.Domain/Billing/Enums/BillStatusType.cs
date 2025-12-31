using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Domain.Billing.Enums
{
    public enum BillStatusType
    {
        Invoiced = 1,
        UnVerifiedPayment = 2,
        VerifiedPayment = 3,
        Cancelled = 4
    }
}
