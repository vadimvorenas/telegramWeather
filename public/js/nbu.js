var selectors = {
  pln: document.getElementById('chartPln').getContext('2d'),
  usd: document.getElementById('chartUsd').getContext('2d'),
  eur: document.getElementById('chartEur').getContext('2d'),
  rub: document.getElementById('chartRub').getContext('2d')
}

startNbu(selectors)

function startNbu(ctx) {
  axios.get('/nbu')
    .then(response => {
      console.log(response.data)
      let labels = {
        pln: [],
        usd: [],
        eur: [],
        rub: []
      }
      let rub = []
      let usd = []
      let pln = []
      let eur = []

      response.data.forEach((element, index) => {
        if (!element.create_date) {
          return false
        }
        if ('PLN' == element.currency.toLocaleUpperCase()) {
          pln.push(getCeilTwo(element.price))
          labels.pln.push(getDate(new Date(element.create_date)))
        } else if ('USD' == element.currency.toLocaleUpperCase()) {
          usd.push(getCeilTwo(element.price))
          labels.usd.push(getDate(new Date(element.create_date)))
        } else if ('EUR' == element.currency.toLocaleUpperCase()) {
          eur.push(getCeilTwo(element.price))
          labels.eur.push(getDate(new Date(element.create_date)))
        } else if ('RUB' == element.currency.toLocaleUpperCase()) {
          rub.push(getCeilTwo(element.price))
          labels.rub.push(getDate(new Date(element.create_date)))
        }
      });
      console.log(labels)
      console.log(rub, usd, pln, eur)

      var chart_pln = new Chart(ctx.pln, {
        type: 'line',
        data: {
          labels: labels.pln,
          datasets: [{
            label: 'PLN',
            borderColor: 'rgb(255, 99, 132)',
            data: pln
          }
          ]
        },
        options: {
          responsive: false,
          scales: {
            yAxes: [{
              ticks: {
                callback: function (value, index, values) {
                  return 'UAH ' + value;
                }
              }
            }]
          }
        }
      });
      var chart_rub = new Chart(ctx.rub, {
        type: 'line',
        data: {
          labels: labels.rub,
          datasets: [
            {
              label: 'RUB',
              borderColor: 'rgb(255, 159, 64)',
              data: rub
            }
          ]
        },
        options: {
          responsive: false,
          scales: {
            yAxes: [{
              ticks: {
                callback: function (value, index, values) {
                  return 'UAH ' + value;
                }
              }
            }]
          }
        }
      });
      var chart_eur = new Chart(ctx.eur, {
        type: 'line',
        data: {
          labels: labels.eur,
          datasets: [
            {
              label: 'EUR',
              borderColor: 'rgb(255, 189, 64)',
              data: eur
            }
          ]
        },
        options: {
          responsive: false,
          scales: {
            yAxes: [{
              ticks: {
                callback: function (value, index, values) {
                  return 'UAH ' + value;
                }
              }
            }]
          }
        }
      });
      var chart_usd = new Chart(ctx.usd, {
        type: 'line',
        data: {
          labels: labels.usd,
          datasets: [
            {
              label: 'USD',
              borderColor: 'rgb(255, 109, 64)',
              data: usd
            }
          ]
        },
        options: {
          responsive: false,
          scales: {
            yAxes: [{
              ticks: {
                callback: function (value, index, values) {
                  return 'UAH ' + value;
                }
              }
            }]
          }
        }
      });
    })
}

function getCeilTwo(ceil) {
  return Math.floor(ceil * 100) / 100
}

function getDate(date) {
  if (date instanceof Date) {
    return date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDay()
  }
  return false
}

// function f1() {
//   var chart = new Chart(ctx, {
//     // The type of chart we want to create
//     type: 'line',

//     // The data for our dataset
//     data: {
//       labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 1, 2, 3, 4],
//       datasets: [{
//         label: 'My First dataset',
//         // backgroundColor: 'rgb(255, 99, 132)',
//         borderColor: 'rgb(255, 99, 132)',
//         data: [0, 10, 5, 2, 20, 30, 45, 50, 55]
//       },
//       {
//         label: 'My two tho tho',
//         // backgroundColor: 'rgb(255, 159, 64)',
//         borderColor: 'rgb(255, 159, 64)',
//         data: [33, 54, 32, 64, 65, 76, 43, 23, 54, 64, 12]
//       }
//       ]
//     },

//     // Configuration options go here
//     options: {
//       responsive: false,
//       scales: {
//         yAxes: [{
//           ticks: {
//             // Include a dollar sign in the ticks
//             callback: function (value, index, values) {
//               return '$' + value;
//             }
//           }
//         }]
//       }
//     }
//   });
// }