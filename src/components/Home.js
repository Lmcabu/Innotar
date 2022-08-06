import React, { Component } from "react";
import Web3 from "web3";
import Meme from "../abis/Meme.json";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
}); 

class Home extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }


  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    const networkData = Meme.networks[networkId];
    if (networkData) {
      // Fetch the contract
      const abi = Meme.abi;
      const address = networkData.address;
      const contract = web3.eth.Contract(abi, address);
      this.setState({ contract });
      console.log(contract);
      const memeHash = await contract.methods.get().call();
      console.log(memeHash);
      this.setState({ memeHash }, () => {
        console.log(this.state.memeHash, "Hash after");
      });
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      memeHash: "QmeesNVWTooMQgqmszfcWhjdd7fvVmGbvVKVGLsThqTqk1",
      contract: null,
      web3: null,
      account: null,
      ethAddress: "0x0BFe599eaE812F3900F2eB77Fb3608fe00E48a25",
      blockNumber: "",
      transactionHash: "",
      gasUsed: "",
      txReceipt: null,
      data: "",
      print: false,
    };
  }

  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
      console.log("Ipfs Hash", this.state.memeHash);
    };
  };

  onSubmit = (event) => {
    const web3 = window.web3;
    event.preventDefault();
    console.log("Submitting file to ipfs...");

    //obtain contract address from storehash.js
    const ethAddress = this.state.contract.options.address;
    console.log("ethAddress before", ethAddress);
    this.setState({ ethAddress }, () => {
      console.log(this.state.ethAddress, "ethAddress after");
    });

    ipfs.add(this.state.buffer, (error, result) => {
      console.log("Ipfs result", result);
      const memeHash = result[0].hash;
      console.log("Ipfs Hash", this.state.memeHash);
      this.setState({ blockNumber: "waiting.." }, () => {
        console.log(this.state.blockNumber, "blockNumber 1");
      });
      this.setState({ gasUsed: "waiting..." }, () => {
        console.log(this.state.gasUsed, "gasUsed 1");
      });
      this.setState({ memeHash }, () => {
        console.log(this.state.memeHash, "Hash after");
      });
      if (error) {
        console.error(error);
        return;
      }
      this.state.contract.methods.set(result[0].hash).send(
        {
          from: this.state.account,
        },
        (error, transactionHash) => {
          console.log("transactionHash", transactionHash);
          this.setState({ transactionHash });
          console.log("transactionHash", this.state.transactionHash);
        }
      );

      const txReceipt = web3.eth.getTransaction(this.state.transactionHash);
      txReceipt.then((txReceipt) => this.setState({ txReceipt }));
      console.log("txReceipt1", this.state.txReceipt);
      this.setState({ gasUsed: txReceipt.gasUsed }, () => {
        console.log(this.state.gasUsed, "gasUsed");
      });
    });
    
    web3.eth.getTransaction(this.state.transactionHash).then(console.log);
  };

  getData = (event) => {
    event.preventDefault();
    const data = "https://ipfs.infura.io/ipfs/" + event.target.value;
    this.setState({ data }, () => {
      console.log("event.target.value", this.state.data);
    });
    this.setState({ print: false });
  };

  render() {
    return (
      <div className="home-content">
        <div class="left">
          <p>&nbsp;</p>
          <h1 class="text-center">Notarization</h1>
          <p>&nbsp;</p>
          <h3 class="text-center">Start your notarization now</h3>
          <button
            type="button"
            value="submit"
            className="bt-home"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/certify";
            }}
          >
            Start Notarize
          </button>
          <br />
          <br />
          <br />
          <h3 class="text-center">
            Do you want to verify the authenticity of a file?{" "}
          </h3>
          <br />
          <button
            type="button"
            value="submit"
            className="bt-home"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/vertify";
            }}
          >
            Start Verify
          </button>
          <br />
          <br />
          <br />
          <h3 class="text-center">
            Get your stored file from a decentralized network
          </h3>
          <br />
          <button
            type="button"
            value="submit"
            className="bt-home"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/fetch";
            }}
          >
            Get
          </button>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
         
        </div>
        <div class="right">
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <video
            class="video-js vjs-default-skin vjs-big-play-centered vjs-16-9"
            controls
            preload="none"
            muted
            playsInline
            data-setup="{}"
            width="100%"
            height="100%"
            autoplay="autoplay"
            loop="loop"
          >
            <source src={require("./intro.mp4")} type="video/mp4" />
          </video>

          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
          <p>&nbsp;</p>

        </div>
        <p>&nbsp;</p> 
        <p>&nbsp;</p>
      </div>
    );
  }
}
export default Home;
