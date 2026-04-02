const path = require('path');
const fs = require('fs');
const { parseSBIStatement } = require('../utils/csvParser');

describe('CSV Parser Edge Cases & Logic', () => {

  const testCsvPath = path.join(__dirname, 'test_statement.csv');

  afterEach(() => {
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  it('should categorize P2P transfers correctly as Personal Transfers rather than Investments', async () => {
    const csvContent = [
      'Metadata,,,,,',
      'Discarded Row,,,,,',
      'Date,Details,Ref No,Debit,Credit,Balance',
      '20-03-26,WDL TFR UPI/DR/12345/Manoj Ku/YESB,REF1,500,,10000',
      '21-03-26,WDL TFR UPI/DR/67890/ZERODHA/ICIC,REF2,15000,,8000',
    ].join('\n');
    fs.writeFileSync(testCsvPath, csvContent);

    const transactions = await parseSBIStatement(testCsvPath, 'test_statement.csv');
    
    expect(transactions.length).toBe(2);
    
    // Manoj Ku -> Personal Transfers
    expect(transactions[0].merchantName).toBe('Manoj Ku');
    expect(transactions[0].categoryName).toBe('Personal Transfers');
    
    // ZERODHA -> Transfer & Investments
    expect(transactions[1].merchantName).toBe('ZERODHA');
    expect(transactions[1].categoryName).toBe('Transfer & Investments');
  });

  it('should seamlessly fix the newline-broken description bug', async () => {
    const csvContent = [
      'Date,Details,Ref No,Debit,Credit,Balance',
      '20-03-26,UPI/DR/12345/BLINKIT/HDFC,REF1,250,,10000',
      ',/blinkit@hdfc,,,,,',
    ].join('\n');
    fs.writeFileSync(testCsvPath, csvContent);

    const transactions = await parseSBIStatement(testCsvPath, 'test_statement.csv');
    expect(transactions.length).toBe(1);
    expect(transactions[0].description).toBe('UPI/DR/12345/BLINKIT/HDFC /blinkit@hdfc');
    expect(transactions[0].merchantName).toBe('BLINKIT');
  });

  it('should gracefully throw MALFORMED_CSV error for unparseable or completely missing data headers', async () => {
    const csvContent = [
      'Just,Random,Garbage',
      'No,Statement,Headers,Here',
    ].join('\n');
    fs.writeFileSync(testCsvPath, csvContent);

    await expect(parseSBIStatement(testCsvPath, 'broken.csv')).rejects.toThrow('MALFORMED_CSV');
  });
});
