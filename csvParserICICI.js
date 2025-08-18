import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, ChevronDown, ChevronRight, DollarSign, Calendar, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import Papa from 'papaparse';

const CSVBankStatementParser = () => {
  const [fileData, setFileData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    customer: true,
    summary: true,
    accounts: true,
    deposits: true,
    transactions: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const parseCSVData = (text) => {
    try {
      // Parse CSV with Papa Parse
      const result = Papa.parse(text, {
        skipEmptyLines: true,
        dynamicTyping: true,
        delimitersToGuess: [',', '\t', '|', ';']
      });
      
      const rows = result.data;
      
      // Extract different sections from the CSV
      const extractedData = {
        customerInfo: {},
        accountSummary: {},
        accountDetails: [],
        fixedDeposits: [],
        transactions: [],
        rewardPoints: [],
        accountInfo: []
      };

      let currentSection = '';
      let transactionStarted = false;
      let accountDetailsStarted = false;
      let fixedDepositsStarted = false;
      let rewardPointsStarted = false;
      let accountInfoStarted = false;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const firstCell = row[0] ? String(row[0]).trim() : '';
        
        // Extract customer information
        if (i < 10 && firstCell && !firstCell.includes('STATEMENT')) {
          if (firstCell.includes('MR.') || firstCell.includes('MS.') || firstCell.includes('MRS.')) {
            extractedData.customerInfo.name = firstCell;
          } else if (firstCell && row.length > 1 && !firstCell.includes(':')) {
            extractedData.customerInfo.address = (extractedData.customerInfo.address || '') + firstCell + ' ';
          }
        }

        // Extract account summary
        if (firstCell.includes('STATEMENT SUMMARY')) {
          const match = firstCell.match(/Customer ID:\s*(\w+)/);
          if (match) {
            extractedData.customerInfo.customerId = match[1];
          }
          const dateMatch = firstCell.match(/as on\s+(.+?)(?:\s+2\d{3}|$)/);
          if (dateMatch) {
            extractedData.accountSummary.statementDate = dateMatch[0];
          }
        }

        // Extract balance information
        if (firstCell === 'RELATIONSHIP' && row[1] === 'BALANCE') {
          for (let j = i + 1; j < i + 10 && j < rows.length; j++) {
            const balanceRow = rows[j];
            if (balanceRow[0] && balanceRow[1]) {
              const label = String(balanceRow[0]).trim();
              const value = balanceRow[1];
              if (label.includes('Savings Account Balance')) {
                extractedData.accountSummary.savingsBalance = value;
              } else if (label.includes('Fixed Deposits linked')) {
                extractedData.accountSummary.linkedFDBalance = value;
              } else if (label.includes('Total Savings')) {
                extractedData.accountSummary.totalSavingsBalance = value;
              } else if (label === 'TOTAL DEPOSITS') {
                extractedData.accountSummary.totalDeposits = value;
              }
            }
          }
        }

        // Extract account details
        if (firstCell === 'ACCOUNT TYPE' && !accountDetailsStarted) {
          accountDetailsStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          for (let j = i + 1; j < rows.length; j++) {
            const detailRow = rows[j];
            if (detailRow[0] === 'Total' || !detailRow[0]) break;
            const accountDetail = {};
            headers.forEach((header, idx) => {
              if (header && detailRow[idx] !== undefined) {
                accountDetail[header] = detailRow[idx];
              }
            });
            if (Object.keys(accountDetail).length > 0) {
              extractedData.accountDetails.push(accountDetail);
            }
          }
        }

        // Extract fixed deposits
        if (firstCell === 'DEPOSIT NO.' && !fixedDepositsStarted) {
          fixedDepositsStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          for (let j = i + 1; j < rows.length; j++) {
            const fdRow = rows[j];
            if (!fdRow[0] || String(fdRow[0]).includes('TOTAL') || String(fdRow[0]).includes('SUB TOTAL')) break;
            const fd = {};
            headers.forEach((header, idx) => {
              if (header && fdRow[idx] !== undefined) {
                fd[header] = fdRow[idx];
              }
            });
            if (Object.keys(fd).length > 0 && fd['DEPOSIT NO.']) {
              extractedData.fixedDeposits.push(fd);
            }
          }
        }

        // Extract transactions
        if (firstCell === 'DATE' && row[1] === 'MODE' && !transactionStarted) {
          transactionStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          for (let j = i + 1; j < rows.length; j++) {
            const txnRow = rows[j];
            if (!txnRow[0]) break;
            const transaction = {};
            headers.forEach((header, idx) => {
              if (header && txnRow[idx] !== undefined) {
                transaction[header] = txnRow[idx];
              }
            });
            if (Object.keys(transaction).length > 0 && transaction.DATE) {
              extractedData.transactions.push(transaction);
            }
          }
        }

        // Extract reward points
        if (firstCell === 'SAVINGS ACCOUNT NUMBER' && !rewardPointsStarted) {
          rewardPointsStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          for (let j = i + 1; j < rows.length; j++) {
            const rpRow = rows[j];
            if (!rpRow[0] || rpRow[0] === 'Account Related Other Information') break;
            const rewardPoint = {};
            headers.forEach((header, idx) => {
              if (header && rpRow[idx] !== undefined) {
                rewardPoint[header] = rpRow[idx];
              }
            });
            if (Object.keys(rewardPoint).length > 0) {
              extractedData.rewardPoints.push(rewardPoint);
            }
          }
        }

        // Extract account info
        if (firstCell === 'ACCOUNT TYPE' && row[1] === ' ACCOUNT NUMBER' && !accountInfoStarted) {
          accountInfoStarted = true;
          const headers = row.map(h => h ? String(h).trim() : '');
          for (let j = i + 1; j < rows.length; j++) {
            const infoRow = rows[j];
            if (!infoRow[0]) break;
            const info = {};
            headers.forEach((header, idx) => {
              if (header && infoRow[idx] !== undefined) {
                info[header] = infoRow[idx];
              }
            });
            if (Object.keys(info).length > 0) {
              extractedData.accountInfo.push(info);
            }
          }
        }
      }

      setParsedData(extractedData);
      setError(null);
    } catch (err) {
      setError('Error parsing CSV file: ' + err.message);
      setParsedData(null);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.CSV')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setFileData({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        content: text
      });
      parseCSVData(text);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const SectionHeader = ({ title, section, icon: Icon }) => (
    <div 
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      {expandedSections[section] ? 
        <ChevronDown className="w-5 h-5 text-gray-500" /> : 
        <ChevronRight className="w-5 h-5 text-gray-500" />
      }
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bank Statement CSV Parser</h1>
            <p className="text-gray-600">Upload your bank statement CSV file to extract and analyze data</p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <label className="relative block">
              <input
                type="file"
                accept=".csv,.CSV"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Click to upload CSV file</p>
                <p className="text-sm text-gray-500">or drag and drop your file here</p>
              </div>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* File Info */}
          {fileData && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">{fileData.name}</p>
                <p className="text-green-600 text-sm">Size: {fileData.size}</p>
              </div>
            </div>
          )}

          {/* Parsed Data Display */}
          {parsedData && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <SectionHeader title="Customer Information" section="customer" icon={null} />
                {expandedSections.customer && parsedData.customerInfo && (
                  <div className="p-4 space-y-2">
                    {parsedData.customerInfo.name && (
                      <p><span className="font-medium">Name:</span> {parsedData.customerInfo.name}</p>
                    )}
                    {parsedData.customerInfo.customerId && (
                      <p><span className="font-medium">Customer ID:</span> {parsedData.customerInfo.customerId}</p>
                    )}
                    {parsedData.customerInfo.address && (
                      <p><span className="font-medium">Address:</span> {parsedData.customerInfo.address}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Account Summary */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <SectionHeader title="Account Summary" section="summary" icon={DollarSign} />
                {expandedSections.summary && parsedData.accountSummary && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedData.accountSummary.savingsBalance && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Savings Balance</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(parsedData.accountSummary.savingsBalance)}
                        </p>
                      </div>
                    )}
                    {parsedData.accountSummary.linkedFDBalance && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Linked FD Balance</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(parsedData.accountSummary.linkedFDBalance)}
                        </p>
                      </div>
                    )}
                    {parsedData.accountSummary.totalSavingsBalance && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Savings Balance</p>
                        <p className="text-xl font-bold text-purple-600">
                          {formatCurrency(parsedData.accountSummary.totalSavingsBalance)}
                        </p>
                      </div>
                    )}
                    {parsedData.accountSummary.totalDeposits && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Total Deposits</p>
                        <p className="text-xl font-bold text-indigo-600">
                          {formatCurrency(parsedData.accountSummary.totalDeposits)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fixed Deposits */}
              {parsedData.fixedDeposits && parsedData.fixedDeposits.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <SectionHeader title="Fixed Deposits" section="deposits" icon={CreditCard} />
                  {expandedSections.deposits && (
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Deposit No.</th>
                            <th className="text-left p-2">Open Date</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">ROI %</th>
                            <th className="text-left p-2">Maturity Date</th>
                            <th className="text-left p-2">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.fixedDeposits.map((fd, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-2">{fd['DEPOSIT NO.']}</td>
                              <td className="p-2">{fd['OPEN DATE']}</td>
                              <td className="p-2">{formatCurrency(fd['DEP. AMT. #'])}</td>
                              <td className="p-2">{fd['ROI%']}%</td>
                              <td className="p-2">{fd['MAT. DATE']}</td>
                              <td className="p-2">{formatCurrency(fd['BALANCE *'])}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Transactions */}
              {parsedData.transactions && parsedData.transactions.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <SectionHeader title={`Transactions (${parsedData.transactions.length})`} section="transactions" icon={Calendar} />
                  {expandedSections.transactions && (
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Mode</th>
                            <th className="text-left p-2">Particulars</th>
                            <th className="text-right p-2">Deposits</th>
                            <th className="text-right p-2">Withdrawals</th>
                            <th className="text-right p-2">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.transactions.map((txn, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-2 whitespace-nowrap">{txn.DATE}</td>
                              <td className="p-2">{txn.MODE || '-'}</td>
                              <td className="p-2 text-xs max-w-xs truncate" title={txn.PARTICULARS}>
                                {txn.PARTICULARS || '-'}
                              </td>
                              <td className="p-2 text-right">
                                {txn.DEPOSITS > 0 && (
                                  <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {formatCurrency(txn.DEPOSITS)}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-right">
                                {txn.WITHDRAWALS > 0 && (
                                  <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    {formatCurrency(txn.WITHDRAWALS)}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-right font-medium">
                                {formatCurrency(txn.BALANCE)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVBankStatementParser;