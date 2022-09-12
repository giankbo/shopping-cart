import React from "react";
import axios from "axios";
import {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    CloseButton,
    Form,
  } from "react-bootstrap";
  import 'bootstrap/dist/css/bootstrap.css';
  import './products.css'

// sumulate getting products from DataBase
const products = [
    { name: "Apples :", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans  :", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
  ];
  //=========Cart=============
  // not used
  /*
  const Cart = (props) => {
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);
  
    return <Accordion defaultActiveKey="0">{list}</Accordion>;
  };
  */
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
    console.log(`useDataApi called`);
    useEffect(() => {
      console.log("useEffect Called");
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          console.log("FETCH FROM URl");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };
  
  const Products = (props) => {
    const { useState } = React;
    const [items, setItems] = useState(products);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    //  Fetch Data
    const [query, setQuery] = useState("http://localhost:1337/api/products");
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        "http://localhost:1337/api/products",
      {
        data: [],
      }
    );
    console.log(`Rendering Products ${JSON.stringify(data)}`);
    // Fetch Data
    const addToCart = (e) => {
      let name = e.target.name;
      let item = items.filter((item) => item.name == name);
      if (item[0].instock == 0) return;
      item[0].instock = item[0].instock - 1;
      console.log(`add to Cart ${JSON.stringify(item)}`);
      setCart([...cart, ...item]);
    };
    const deleteCartItem = (delIndex) => {
      // this is the index in the cart not in the Product List
  
      let newCart = cart.filter((item, i) => delIndex != i);
      let target = cart.filter((item, index) => delIndex == index);
      let newItems = items.map((item, index) => {
        if (item.name == target[0].name) item.instock = item.instock + 1;
        return item;
      });
      setCart(newCart);
      setItems(newItems);
    };
    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];
  
    let list = items.map((item, index) => {
      let n = index + 1049;
      let uhit = "https://picsum.photos/" + n;
      return (
        
        <Card style={{border:'none'}} key={index}>
          <Container>
          <Row className="align-items-center">
            <Col xs lg="3">
              <Image src={uhit} width={70} roundedCircle></Image>
            </Col>
            <Col md="auto">
                  <Button variant="light" size="large">
                    {item.name} $ {item.cost} Stock={item.instock}
                  </Button>
                  <br />
                  <Button variant="primary" id='cart-button' size="large" name={item.name} onClick={addToCart}>Submit</Button>
            </Col>
          </Row>
          </Container>
        </Card>
      );
    });
    let cartList = cart.map((item, index) => {
      return (
        <Accordion key={index}>
          <Accordion.Item variant="link" eventKey={1 + index}>
              <Accordion.Header>
                <strong>{item.name}</strong> (1 piece)
              </Accordion.Header>
              <Accordion.Body
                  onClick={() => deleteCartItem(index)}
                  eventKey={1 + index}
              >
                  $ {item.cost} from {item.country} 
                  <CloseButton  />
              </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      );
    });
  
    let finalList = () => {
      let total = checkOut();
      let final = cart.map((item, index) => {
        return (
          <div key={index} index={index}>
            {item.name} $ {item.cost}
          </div>
        );
      });
      return { final, total };
    };
  
    const checkOut = () => {
      let costs = cart.map((item) => item.cost);
      const reducer = (accum, current) => accum + current;
      let newTotal = costs.reduce(reducer, 0);
      console.log(`total updated to ${newTotal}`);
      //cart.map((item, index) => deleteCartItem(index));
      return newTotal;
    };
    const restockProducts = (url) => {
      doFetch(url);
      let newItems = data.data.map((item) => {
        let { name, country, cost, instock } = item.attributes;
        return { name, country, cost, instock };
      });
      setItems([...items, ...newItems]);
    };
  
    return (
      <Container id='cart-container' >
        <h1><strong>React Shopping Cart</strong></h1>
        <h5>See how we restock products!</h5>
        <Row id='cart-row'>
          <Col id='cart-col'>
            <h3>Product List</h3>
            <ul>{list}</ul>
          </Col>
          <Col id='cart-col'>
            <h3>Cart Contents</h3>
            <Accordion>{cartList}</Accordion>
          </Col>
          <Col id='cart-col'>
            <h3>CheckOut </h3>
            <Card>
              <Button variant="light" onClick={checkOut}><strong>CheckOut $ {finalList().total}</strong></Button>
              <ul>{finalList().total > 0 && finalList().final}</ul>
            </Card>
          </Col>
        </Row>
        <Row>
          <Form
            onSubmit={(event) => {
              restockProducts(`http://localhost:1337/api/${query}`);
              console.log(`Restock called on ${query}`);
              event.preventDefault();
            }}
          >
            <Col sm="3">
              <Form.Control
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button id='cart-button'>ReStock Products</Button>
            </Col>
          </Form>
        </Row>
      </Container>
    );
  };

  export default Products;