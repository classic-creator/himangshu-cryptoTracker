
import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  createTheme,
  TableCell,
  LinearProgress,
  ThemeProvider,
  Typography,
  TextField,
  TableBody,
  TableRow,
  TableHead,
  TableContainer,
  Table,
  Paper,
} from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { setCoinList, updateCoinPrice } from "../Reducer/cryptoSlice";
import { CryptoState } from "../CryptoContext";
import { useHistory } from "react-router-dom";
import { Line } from "react-chartjs-2";

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const useStyles = makeStyles({
  row: {
    backgroundColor: "#16171a",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#131111",
    },
    fontFamily: "Montserrat",
    transition: "background-color 0.3s ease",
  },
  highlighted: {
    backgroundColor: "#1a3a1a !important",
  },
  pagination: {
    "& .MuiPaginationItem-root": {
      color: "gold",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#fff",
    },
    type: "dark",
  },
});

export default function CoinsTable() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [highlightedRows, setHighlightedRows] = useState({});
  const { currency, symbol } = CryptoState();

  const { coinList, coins } = useSelector((state) => state.crypto);
  const loading = coinList.length === 0;

  const prevPrices = useRef({});

  useEffect(() => {
    const fetchCoins = async () => {
      const res = await fetch(
        // `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d&sparkline=true`

      );
      const data = await res.json();
      dispatch(setCoinList(data));
    };
    fetchCoins();
  }, [currency, dispatch]);

  useEffect(() => {
    if (!coinList.length) return;

    const symbols = coinList.map((coin) => coin.symbol);
    // const ws = connectToWebSocket(symbols, currency, dispatch);

    let isMounted = true;

    const interval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const res = await fetch(
          // `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`
        );
        const data = await res.json();

        const newHighlights = {};

        data.forEach((coin) => {
          const symbol = coin.symbol.toUpperCase();
          const newPrice = coin.current_price;
          const oldPrice = prevPrices.current[symbol];

          if (oldPrice && oldPrice !== newPrice) {
            newHighlights[symbol] = true;

            setTimeout(() => {
              setHighlightedRows((prev) => {
                const updated = { ...prev };
                delete updated[symbol];
                return updated;
              });
            }, 2000);
          }

          prevPrices.current[symbol] = newPrice;

          dispatch(
            updateCoinPrice({
              symbol,
              price: newPrice,
            })
          );
        });

        setHighlightedRows((prev) => ({ ...prev, ...newHighlights }));
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 15000);

    return () => {
      // ws.close();
      isMounted = false;
      clearInterval(interval);
    };
  }, [coinList, currency, dispatch]);

  const handleSearch = () => {
    return coinList.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
    );
  };


  const prepareChartData = (coin) => {
    const prices = coin.sparkline_in_7d.price;
    const labels = prices.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index)); // Adjusting for 7-day range
      return date.toLocaleDateString();
    });
  
    return {
      labels: prices.map((_, index) => index),
   
      datasets: [
        {
          label: `${coin.name} Price (Last 7 Days)`,
          data: prices,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          fill: false,
          borderWidth: 1,
          tension: 0.3,   // Smooth curve
          pointRadius: 0,
        },
      ],
    };
  };
  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
    },
    scales: {
      x: {
        display: false, // Hide X-axis
      },
      y: {
        display: false, // Hide Y-axis
      },
    },
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <Container style={{ textAlign: "center" }}>

        <TextField
          label="Search For a Crypto Currency.."
          variant="outlined"
          style={{ marginBottom: 20, width: "100%" }}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TableContainer component={Paper}>
          {loading ? (
            <LinearProgress style={{ backgroundColor: "white" }} />
          ) : (
            <Table aria-label="simple table">
              <TableHead style={{ backgroundColor: "white" }}>
                <TableRow>
                  {[
                    "Coin",
                    "Price",
                    "24h%",
                    "Market Cap",
                    "1h%",
                    "7D%",
                    "Volume (24h)",
                    "Circulating Supply",
                    "Last 7D"
                  ].map((head) => (
                    <TableCell
                      key={head}
                      align={head === "Coin" ? "left" : "right"}
                      style={{
                        color: "black",
                        fontWeight: "700",
                        fontFamily: "Montserrat",
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {handleSearch()
                  .slice((page - 1) * 10, (page - 1) * 10 + 10)
                  .map((coin) => {
                    const liveData = coins[coin.symbol.toUpperCase()];
                    const price = liveData?.price || coin.current_price;
                    const change24h = coin.price_change_percentage_24h;
                    const marketCap = coin.market_cap;
                    const change1h = coin.price_change_percentage_1h_in_currency;
                    const change7d = coin.price_change_percentage_7d_in_currency;
                    const volume = coin.total_volume;
                    const circulatingSupply = coin.circulating_supply;
                    const isHighlighted = highlightedRows[coin.symbol.toUpperCase()];

                    return (
                      <TableRow
                        key={coin.id}
                       
                        className={`${classes.row} ${isHighlighted ? classes.highlighted : ""}`}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          style={{ display: "flex", gap: 15 }}
                        >
                          <img
                            src={coin.image}
                            alt={coin.name}
                            height="50"
                            style={{ marginBottom: 10 }}
                          />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ textTransform: "uppercase", fontSize: 22 }}>
                              {coin.symbol}
                            </span>
                            <span style={{ color: "darkgrey" }}>{coin.name}</span>
                          </div>
                        </TableCell>

                        <TableCell align="right">
                          {symbol} {numberWithCommas(price.toFixed(2))}
                        </TableCell>

                        <TableCell
                          align="right"
                          style={{
                            color: change24h > 0 ? "rgb(14, 203, 129)" : "red",
                            fontWeight: 500,
                          }}
                        >
                          {change24h > 0 && "+"}
                          {change24h?.toFixed(2)}%
                        </TableCell>

                        <TableCell align="right">
                          {symbol} {numberWithCommas(marketCap.toString().slice(0, -6))}M
                        </TableCell>

                        <TableCell
                          align="right"
                          style={{
                            color: change1h > 0 ? "rgb(14, 203, 129)" : "red",
                            fontWeight: 500,
                          }}
                        >
                          {change1h > 0 && "+"}
                          {change1h?.toFixed(2)}%
                        </TableCell>

                        <TableCell
                          align="right"
                          style={{
                            color: change7d > 0 ? "rgb(14, 203, 129)" : "red",
                            fontWeight: 500,
                          }}
                        >
                          {change7d > 0 && "+"}
                          {change7d?.toFixed(2)}%
                        </TableCell>

                        <TableCell align="right">
                          {symbol} {numberWithCommas(volume?.toFixed(0))}
                        </TableCell>

                        <TableCell align="right">
                          {numberWithCommas(circulatingSupply?.toFixed(0))}
                        </TableCell>
                        <TableCell style={{height:10}}>
                        <div style={{ height: 50 , width:50 }}>
                          <Line data={prepareChartData(coin)} options={sparklineOptions} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

          )}
        </TableContainer>

        <Pagination
          count={Number((handleSearch()?.length / 10).toFixed(0))}
          style={{ padding: 20, width: "100%", display: "flex", justifyContent: "center" }}
          classes={{ ul: classes.pagination }}
          onChange={(_, value) => {
            setPage(value);
            window.scroll(0, 450);
          }}
        />
      </Container>
    </ThemeProvider>
  );
}
