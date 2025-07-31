// Generate monthly trend data for net worth
export const generateNetWorthTrendData = (baseValue: number) => {
  const data = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate a trend that shows general growth with some fluctuation
    const trendFactor = 0.95 + (i * 0.02); // Gradual growth over time
    const randomFactor = 0.95 + (Math.random() * 0.1); // ±5% fluctuation
    const value = Math.round(baseValue * trendFactor * randomFactor);
    
    data.push({
      month: monthNames[monthIndex],
      value: value
    });
  }
  
  return data;
}; 