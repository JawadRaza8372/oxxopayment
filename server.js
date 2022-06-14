require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const engines = require("consolidate");

// app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5500",
//   })
// )
app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("Public"));
const stripe = require("stripe")(
	"sk_test_51L1HRxFdmS6V3E8GSqDuoi7vN6mmS04GOyPjYwMqRcQtShGhplTOih7zaiZP2AbbfgQOMTAQ2wH0zAyuhGy62fWC003qDYDXAk"
);
const storeItems = new Map([
	[1, { priceInCents: 10000, name: "Learn React Today" }],
	[2, { priceInCents: 20000, name: "Learn CSS Today" }],
]);
app.get("/", (req, res) => {
	res.render("index");
});
app.post("/price_set", async (req, res) => {
	const { price } = req.body;
	totalPrice = price;
	res.redirect("/create-checkout-session");
});
app.get("/create-checkout-session", async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["oxxo"],
			mode: "payment",
			payment_method_options: {
				oxxo: {
					expires_after_days: 2,
				},
			},
			line_items: [
				{
					price_data: {
						currency: "mxn",
						product_data: {
							name: "Custom Package",
						},
						unit_amount: parseInt(totalPrice) * 100,
					},
					quantity: 1,
				},
			],

			// line_items: req.body.items.map((item) => {
			// 	const storeItem = storeItems.get(item.id);
			// 	return {
			// 		price_data: {
			// 			currency: "usd",
			// 			product_data: {
			// 				name: storeItem.name,
			// 			},
			// 			unit_amount: storeItem.priceInCents,
			// 		},
			// 		quantity: item.quantity,
			// 	};
			// }),
			success_url: `/success`,
			cancel_url: `/cancel`,
		});
		res.redirect(session.url);
		// res.json({ url: session.url });
	} catch (e) {
		res.status(500).json({ error: e.message });
		console.log(e.message);
	}
});
app.get("/cancel", (req, res) => {
	res.render(`cancel`);
});
app.get("/success", (req, res) => {
	res.render(`success`);
});
const port = process.env.PORT;
app.listen(port, () => {
	console.log(`Server is running: http://localhost:${port}`);
});
