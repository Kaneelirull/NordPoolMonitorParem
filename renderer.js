// Initialize API
const api = new NordPoolAPI();
let priceChart = null;
let currentCountry = 'ee'; // Default country

// Load and display electricity prices
async function loadPrices(forceRefresh = false) {
  try {
    showLoading(true);
    hideError();

    const data = await api.fetchPrices(currentCountry, forceRefresh);
    console.log('Price data loaded:', data);

    updateCurrentPrice(data);
    updateStats(data);
    updateRecommendations(data);
    updateCalculator(data);
    updateChart(data);
    updateLastUpdateTime(data.lastUpdate);
    updateCurrencySymbols(data.currency);
    updateCountryName(data.countryName);

    showLoading(false);
  } catch (error) {
    console.error('Error loading prices:', error);
    showError('Failed to load electricity prices. Please check your internet connection and try again.');
    showLoading(false);
  }
}

// Update currency symbols throughout the UI
function updateCurrencySymbols(currency) {
  document.querySelectorAll('#currency-symbol, .curr-sym').forEach(el => {
    el.textContent = currency;
  });
}

// Update country name in footer
function updateCountryName(countryName) {
  document.getElementById('current-country').textContent = countryName;
}

// Update current price display
function updateCurrentPrice(data) {
  if (!data.current) {
    document.getElementById('current-price').textContent = '--';
    return;
  }

  const price = data.current.pricePerKwh.toFixed(2);
  const priceElement = document.getElementById('current-price');
  priceElement.textContent = price;

  // Apply color based on price zone
  priceElement.className = '';
  priceElement.classList.add(`price-${data.current.zone}`);

  // Update trend indicator
  const trendDiv = document.getElementById('trend-indicator');
  if (data.next) {
    const priceDiff = data.next.price - data.current.price;
    const percentChange = ((priceDiff / data.current.price) * 100).toFixed(1);
    
    let arrow = '';
    let trendText = '';

    if (priceDiff > 0.5) {
      arrow = '↑';
      trendText = `Price increasing by ${percentChange}% next segment`;
    } else if (priceDiff < -0.5) {
      arrow = '↓';
      trendText = `Price decreasing by ${Math.abs(percentChange)}% next segment`;
    } else {
      arrow = '→';
      trendText = 'Price stable next segment';
    }

    trendDiv.textContent = `${arrow} ${trendText}`;
  } else {
    trendDiv.textContent = 'Next segment price not yet available';
  }
}

// Update statistics
function updateStats(data) {
  if (!data.stats) return;

  document.getElementById('min-price').innerHTML = `${data.stats.min.toFixed(2)} <span class="price-unit" style="font-size: 14px;"><span class="curr-sym">${data.currency}</span></span>`;
  document.getElementById('avg-price').innerHTML = `${data.stats.average.toFixed(2)} <span class="price-unit" style="font-size: 14px;"><span class="curr-sym">${data.currency}</span></span>`;
  document.getElementById('max-price').innerHTML = `${data.stats.max.toFixed(2)} <span class="price-unit" style="font-size: 14px;"><span class="curr-sym">${data.currency}</span></span>`;
}

// Update recommendations
function updateRecommendations(data) {
  const cheapestHour = data.today.reduce((min, p) => p.price < min.price ? p : min, data.today[0]);
  const cheapestTime = formatTime(cheapestHour.timestamp);

  // Find 2-hour window with lowest average
  let bestWindow = null;
  let lowestAvg = Infinity;
  
  for (let i = 0; i < data.today.length - 7; i++) { // 8 segments = 2 hours
    const windowPrices = data.today.slice(i, i + 8);
    const avg = windowPrices.reduce((sum, p) => sum + p.price, 0) / windowPrices.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      bestWindow = {
        start: windowPrices[0].timestamp,
        end: windowPrices[windowPrices.length - 1].timestamp
      };
    }
  }

  const bestWindowText = bestWindow 
    ? `${formatTime(bestWindow.start)}–${formatTime(bestWindow.end)}`
    : 'Not available';

  // Tomorrow outlook
  let tomorrowText = 'Not available yet';
  if (data.tomorrow.length > 0) {
    const todayAvg = data.stats.average;
    const tomorrowAvg = data.tomorrow.reduce((sum, p) => sum + p.price, 0) / data.tomorrow.length;
    const diff = ((tomorrowAvg - todayAvg) / todayAvg * 100);
    
    if (diff > 0) {
      tomorrowText = `${diff.toFixed(1)}% higher`;
    } else {
      tomorrowText = `${Math.abs(diff).toFixed(1)}% lower`;
    }
  }

  const recommendationsHTML = `
    <div class="recommendation-item">
      <div class="recommendation-title">Cheapest hour today</div>
      <div class="recommendation-time">${cheapestTime}</div>
    </div>
    <div class="recommendation-item">
      <div class="recommendation-title">Optimal appliance window</div>
      <div class="recommendation-time">${bestWindowText}</div>
    </div>
    <div class="recommendation-item">
      <div class="recommendation-title">Tomorrow's forecast</div>
      <div class="recommendation-time">${tomorrowText}</div>
    </div>
  `;

  document.getElementById('recommendations-content').innerHTML = recommendationsHTML;
}

// Helper function to format time
function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Calculate cost for appliance
function calculateCost(kw, durationMinutes, data) {
  const now = new Date();
  let totalCost = 0;
  let remainingMinutes = durationMinutes;
  
  // Find current segment
  let currentSegmentIndex = data.today.findIndex(p => {
    const pHour = p.timestamp.getHours();
    const pMinute = p.timestamp.getMinutes();
    const pDate = p.timestamp.getDate();
    const nowHour = now.getHours();
    const nowMinute = Math.floor(now.getMinutes() / 15) * 15;
    const nowDate = now.getDate();
    
    return pHour === nowHour && pMinute === nowMinute && pDate === nowDate;
  });

  if (currentSegmentIndex === -1) currentSegmentIndex = 0;

  const allPrices = [...data.today, ...(data.tomorrow || [])];
  
  while (remainingMinutes > 0 && currentSegmentIndex < allPrices.length) {
    const segment = allPrices[currentSegmentIndex];
    const segmentMinutes = Math.min(15, remainingMinutes);
    const segmentHours = segmentMinutes / 60;
    
    totalCost += kw * segmentHours * segment.pricePerKwh;
    
    remainingMinutes -= segmentMinutes;
    currentSegmentIndex++;
  }
  
  return totalCost;
}

// Update calculator
function updateCalculator(data) {
  if (!data.current) return;

  // Typical power consumption values (in kW)
  const DISHWASHER_KW = 1.5;
  const BOILER_KW = 2.0;
  const WASHER_KW = 0.5;
  const HEATPUMP_25_KW = 2.5;
  const HEATPUMP_30_KW = 3.0;
  const HEATPUMP_40_KW = 4.0;
  const GAMING_PC_KW = 0.75;

  // Calculate costs
  const dishwasherCost = calculateCost(DISHWASHER_KW, 60, data);
  const boiler40Cost = calculateCost(BOILER_KW, 60, data);
  const boiler50Cost = calculateCost(BOILER_KW, 75, data);
  const boiler60Cost = calculateCost(BOILER_KW, 90, data);
  const washerCost = calculateCost(WASHER_KW, 60, data);
  const heatpump25Cost = calculateCost(HEATPUMP_25_KW, 60, data);
  const heatpump30Cost = calculateCost(HEATPUMP_30_KW, 60, data);
  const heatpump40Cost = calculateCost(HEATPUMP_40_KW, 60, data);
  const gamingPCCost = calculateCost(GAMING_PC_KW, 60, data);

  // Update display (costs are already in cents/senti - don't multiply by 100!)
  const suffix = data.currency;
  document.getElementById('calc-dishwasher').textContent = `${dishwasherCost.toFixed(2)}${suffix}`;
  document.getElementById('calc-boiler-40').textContent = `${boiler40Cost.toFixed(2)}${suffix}`;
  document.getElementById('calc-boiler-50').textContent = `${boiler50Cost.toFixed(2)}${suffix}`;
  document.getElementById('calc-boiler-60').textContent = `${boiler60Cost.toFixed(2)}${suffix}`;
  document.getElementById('calc-washer').textContent = `${washerCost.toFixed(2)}${suffix}`;
  document.getElementById('calc-heatpump-25').textContent = `${heatpump25Cost.toFixed(2)}${suffix}`;
  document.getElementById('calc-heatpump-30').textContent = `${heatpump30Cost.toFixed(2)}${suffix}`;
  document.getElementById('calc-heatpump-40').textContent = `${heatpump40Cost.toFixed(2)}${suffix}`;
  document.getElementById('calc-gaming-pc').textContent = `${gamingPCCost.toFixed(2)}${suffix}`;
}

// Update chart
function updateChart(data) {
  const ctx = document.getElementById('priceChart').getContext('2d');
  
  // Use ALL prices (yesterday, today, tomorrow) for 48h window
  const allPrices = data.allPrices || [];
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDate = now.getDate();
  
  const currentSegmentMinute = Math.floor(currentMinute / 15) * 15;
  
  const currentIndex = allPrices.findIndex(p => {
    const pHour = p.timestamp.getHours();
    const pMinute = p.timestamp.getMinutes();
    const pDate = p.timestamp.getDate();
    
    return pHour === currentHour && 
           pMinute === currentSegmentMinute && 
           pDate === currentDate;
  });

  console.log(`=== CHART UPDATE (48H CENTERED) ===`);
  console.log(`Current segment: ${currentHour}:${currentSegmentMinute.toString().padStart(2, '0')}`);
  console.log(`Current index: ${currentIndex} of ${allPrices.length} total prices`);
  console.log(`Time range: ${allPrices[0]?.timestamp.toLocaleString()} to ${allPrices[allPrices.length-1]?.timestamp.toLocaleString()}`);

  // Show 24h before (96 segments) and 24h after (96 segments) = 48h total
  const SEGMENTS_BEFORE = 96;  // 24 hours × 4 segments/hour
  const SEGMENTS_AFTER = 96;   // 24 hours × 4 segments/hour
  
  let startIndex = 0;
  let endIndex = allPrices.length;
  let visibleCurrentIndex = -1;
  
  if (currentIndex >= 0) {
    startIndex = Math.max(0, currentIndex - SEGMENTS_BEFORE);
    endIndex = Math.min(allPrices.length, currentIndex + SEGMENTS_AFTER + 1);
    visibleCurrentIndex = currentIndex - startIndex;
    
    console.log(`Window: ${startIndex} to ${endIndex} (current at index ${visibleCurrentIndex} of visible window)`);
  } else {
    console.warn('Current segment not found in price data!');
  }
  
  const visiblePrices = allPrices.slice(startIndex, endIndex);
  
  console.log(`Displaying ${visiblePrices.length} segments (should be ~193 for 48h window)`);
  
  const labels = visiblePrices.map(p => {
    const hour = p.timestamp.getHours();
    const minute = p.timestamp.getMinutes();
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  });

  const prices = visiblePrices.map(p => p.pricePerKwh);
  
  const backgroundColor = [];
  const borderColor = [];
  const borderWidth = [];
  
  visiblePrices.forEach((p, index) => {
    const isCurrent = index === visibleCurrentIndex;
    
    if (isCurrent) {
      backgroundColor.push('#000');
      borderColor.push('#000');
      borderWidth.push(4);
    } else {
      backgroundColor.push(p.color);
      borderColor.push(p.color);
      borderWidth.push(1);
    }
  });

  if (priceChart) {
    priceChart.destroy();
  }

  priceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Price (${data.currency}/kWh)`,
        data: prices,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: borderWidth,
        barPercentage: 0.95,
        categoryPercentage: 0.98
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex + startIndex;
              const price = allPrices[index];
              const isCurrent = context.dataIndex === visibleCurrentIndex;
              const isFuture = price.timestamp > now;
              
              let label = `${context.parsed.y.toFixed(2)} ${data.currency}/kWh`;
              if (isCurrent) label += ' ⚡ CURRENT';
              else if (isFuture) label += ' (upcoming)';
              else label += ' (past)';
              
              return label;
            },
            title: function(context) {
              const index = context[0].dataIndex + startIndex;
              const timestamp = allPrices[index].timestamp;
              const date = timestamp.getDate();
              const today = now.getDate();
              
              const hour = timestamp.getHours();
              const minute = timestamp.getMinutes();
              
              let dayLabel;
              if (date === today) dayLabel = 'Today';
              else if (date > today) dayLabel = 'Tomorrow';
              else dayLabel = 'Yesterday';
              
              return `${dayLabel} ${hour}:${minute.toString().padStart(2, '0')}`;
            }
          },
          backgroundColor: 'rgba(41, 37, 36, 0.95)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: '600',
            family: 'Inter'
          },
          bodyFont: {
            size: 13,
            family: 'Inter'
          },
          borderColor: '#e7e5e4',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: `Price (${data.currency}/kWh)`,
            font: {
              size: 13,
              weight: '500',
              family: 'Inter'
            },
            color: '#78716c'
          },
          ticks: {
            callback: function(value) {
              return value.toFixed(2);
            },
            font: {
              size: 11,
              family: 'Inter'
            },
            color: '#a8a29e'
          },
          grid: {
            color: '#f5f5f4'
          }
        },
        x: {
          title: {
            display: true,
            text: '48-Hour Window (Current Segment Centered)',
            font: {
              size: 13,
              weight: '500',
              family: 'Inter'
            },
            color: '#78716c'
          },
          ticks: {
            callback: function(value, index) {
              const actualIndex = index + startIndex;
              if (actualIndex < allPrices.length) {
                const timestamp = allPrices[actualIndex].timestamp;
                const minute = timestamp.getMinutes();
                const hour = timestamp.getHours();
                
                // Show only even hours at :00 to avoid overlap
                if (minute === 0 && hour % 2 === 0) {
                  return `${hour.toString().padStart(2, '0')}:00`;
                }
              }
              return null;
            },
            maxRotation: 0,
            autoSkip: false,
            font: {
              size: 10,
              family: 'Inter'
            },
            color: '#a8a29e'
          },
          grid: {
            color: function(context) {
              const index = context.index;
              return index === visibleCurrentIndex ? 'rgba(41, 37, 36, 0.2)' : '#f5f5f4';
            },
            lineWidth: function(context) {
              const index = context.index;
              return index === visibleCurrentIndex ? 3 : 1;
            }
          }
        }
      }
    }
  });
}

// Update last update time
function updateLastUpdateTime(date) {
  const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  document.getElementById('last-update').textContent = timeString;
}

// Show/hide loading state
function showLoading(show) {
  // Could add a loading spinner here
}

// Show error message
function showError(message) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
  errorContainer.classList.remove('hidden');
}

// Hide error message
function hideError() {
  document.getElementById('error-container').classList.add('hidden');
}

// Country selector functionality
function setupCountrySelector() {
  // Load saved country from localStorage
  const savedCountry = localStorage.getItem('nordpool-country');
  if (savedCountry && ['ee', 'fi', 'lv', 'lt'].includes(savedCountry)) {
    currentCountry = savedCountry;
  }

  // Update active button
  document.querySelectorAll('.country-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.country === currentCountry) {
      btn.classList.add('active');
    }

    // Add click handler
    btn.addEventListener('click', async () => {
      const newCountry = btn.dataset.country;
      if (newCountry !== currentCountry) {
        currentCountry = newCountry;
        
        // Save to localStorage
        localStorage.setItem('nordpool-country', newCountry);
        
        // Update UI
        document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Reload prices
        await loadPrices(true);
      }
    });
  });
}

// Auto-refresh functionality
function startAutoRefresh() {
  const getMillisecondsUntilNextRefresh = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Refresh at :01, :16, :31, :46
    const refreshMinutes = [1, 16, 31, 46];
    let nextRefreshMinute = refreshMinutes.find(m => m > minutes);
    
    if (!nextRefreshMinute) {
      nextRefreshMinute = refreshMinutes[0];
      const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, nextRefreshMinute, 0, 0);
      return nextHour - now;
    } else {
      const nextRefresh = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), nextRefreshMinute, 0, 0);
      return nextRefresh - now;
    }
  };
  
  const scheduleNextRefresh = () => {
    const msUntilNext = getMillisecondsUntilNextRefresh();
    
    setTimeout(() => {
      console.log('Auto-refresh triggered at 15-minute interval - forcing cache bypass');
      loadPrices(true);
      scheduleNextRefresh();
    }, msUntilNext);
  };
  
  scheduleNextRefresh();
}

// Global refresh function
function refreshData() {
  console.log('Manual refresh triggered - forcing cache bypass');
  loadPrices(true);
}

// Initialize app
async function init() {
  setupCountrySelector();
  await loadPrices();
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', init);
