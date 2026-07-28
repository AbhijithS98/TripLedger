import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '2px solid #000',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyInfo: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  quoteInfo: {
    marginBottom: 30,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    marginBottom: 12,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColWide: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColSmall: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 8,
    fontSize: 10,
  },
  totalSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalBox: {
    width: 200,
    borderTop: '1px solid #000',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default function VoucherDocument({ quote }: { quote: any }) {
  const sortedItems = [...quote.items].sort((a: any, b: any) => a.dayNumber - b.dayNumber);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>TripLedger Voucher</Text>
            <Text style={{ fontSize: 10, marginTop: 5 }}>Status: {quote.status}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>Prepared by:</Text>
            <Text style={{ fontWeight: 'bold' }}>{quote.agent?.name}</Text>
            <Text>{quote.agent?.email}</Text>
            <Text>Date: {new Date(quote.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.quoteInfo}>
          <Text style={styles.label}>Quotation For:</Text>
          <Text style={styles.value}>{quote.customerName}</Text>
          
          <Text style={styles.label}>Reference Number:</Text>
          <Text style={styles.value}>{quote.id.slice(-6).toUpperCase()}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCell}>Day</Text>
            </View>
            <View style={styles.tableColWide}>
              <Text style={styles.tableCell}>Package Details</Text>
            </View>
            <View style={styles.tableColSmall}>
              <Text style={styles.tableCell}>Qty</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Price</Text>
            </View>
          </View>

          {sortedItems.map((item: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{item.dayNumber}</Text>
              </View>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>{item.package.title}</Text>
                <Text style={{ fontSize: 8, margin: '0 8px 8px 8px', color: '#666' }}>
                  {item.package.destination} • {item.package.nights} Night(s)
                </Text>
              </View>
              <View style={styles.tableColSmall}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>${(item.unitPrice * item.quantity).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>${quote.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
