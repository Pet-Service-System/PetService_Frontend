import React, { useEffect, useState } from "react";
import axios from "axios";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function AccordionItem() {
  const [loading, setLoading] = useState(true);

  
  return (
    <div>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : mostOrderedProducts.length > 0 ? (
        <div>
          {/* <Typography variant="h6">Top 3 Most Ordered Products</Typography>
          {mostOrderedProducts.map((product) => (
            <Accordion key={product.ProductID}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel-content"
                id="panel-header"
              >
                <Typography>{product.ProductName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{product.Description}</Typography>
                <Typography>Order Count: {product.orderCount}</Typography>
              </AccordionDetails>
            </Accordion>
          ))} */}
        </div>
      ) : (
        <Typography>No most ordered products found.</Typography>
      )}
    </div>
  );
}
