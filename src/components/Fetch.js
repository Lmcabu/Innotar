import React, { Component } from 'react';
import Web3 from 'web3';
import Meme from '../abis/Meme.json'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class Home extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({method: 'eth_requestAccounts'});
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    console.log(networkId)
    const networkData = Meme.networks[networkId]
    if(networkData) {
      // Fetch the contract
      const abi= Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi,address)
      this.setState({ contract })
      console.log(contract)
      const memeHash = await contract.methods.get().call()
      console.log(memeHash)
      this.setState({memeHash }, () => {
            console.log(this.state.memeHash, 'Hash after');
      }); 
    } else {
     window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      memeHash:'QmeesNVWTooMQgqmszfcWhjdd7fvVmGbvVKVGLsThqTqk1',
      contract: null,
      web3: null,
      account: null,
      ethAddress:'0x0BFe599eaE812F3900F2eB77Fb3608fe00E48a25',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: null,
      data:'',
      print:false  
    };
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
      console.log('Ipfs Hash', this.state.memeHash)
    }
  }

  

  onSubmit =  (event) => {
    const web3 = window.web3
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    
    //obtain contract address from storehash.js
    const ethAddress= this.state.contract.options.address;
    console.log("ethAddress before",ethAddress)
    this.setState({ ethAddress }, () => {
            console.log(this.state.ethAddress, 'ethAddress after');
    }); 
    
    ipfs.add(this.state.buffer, (error, result) => {
        console.log('Ipfs result', result)
        const memeHash = result[0].hash
        console.log('Ipfs Hash', this.state.memeHash)
        this.setState({blockNumber:"waiting.."}, () => {
            console.log(this.state.blockNumber, 'blockNumber 1');
        }); 
        this.setState({gasUsed: "waiting..."}, () => {
            console.log(this.state.gasUsed, 'gasUsed 1');
        }); 
        this.setState({ memeHash }, () => {
            console.log(this.state.memeHash, 'Hash after');
        }); 
       if(error) {
        console.error(error)
        return
        }
        this.state.contract.methods.set(result[0].hash).send({
          from: this.state.account}, (error, transactionHash) => {
           console.log('transactionHash',transactionHash)
           this.setState({transactionHash});
           console.log('transactionHash', this.state.transactionHash)
        });

        const txReceipt = web3.eth.getTransaction(this.state.transactionHash)
        txReceipt.then((txReceipt) => this.setState({ txReceipt }))
        console.log('txReceipt1', this.state.txReceipt)
        this.setState({gasUsed: txReceipt.gasUsed}, () => {
        console.log(this.state.gasUsed, 'gasUsed'); 
        }); 

    })
     
      web3.eth.getTransaction(this.state.transactionHash)
      .then(console.log);
  }

  
  getData=(event)=>{
     event.preventDefault()
     console.log("event",event)
     console.log("event.target",event.target)
    console.log("event.target.value",event.target.value)
     const data="https://ipfs.infura.io/ipfs/"+event.target.value
     this.setState({data},()=>{
        console.log("data",this.state.data)
     });
     this.setState({print:false});     
  }
  render() {
    return (
      <div>
        <div className="container-fluid mt-5">
          <h1 class="text-center" id="title">
            Get files from the decentralized network
          </h1>
          <p>&nbsp;</p>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h3> Please input the file's IPFS hash code</h3>
                <p>&nbsp;</p>
                <input type="text" onChange={this.getData} />
                <br /> <br /> <br />
                <button
                  type="button"
                  className="bt-get-file"
                  onClick={() => this.setState({ print: true })}
                >
                  {" "}
                  Get File{" "}
                </button>
                <p>&nbsp;</p>
                {this.state.print ? (
                  <a href={this.state.data}> Your File </a>
                ) : null}
              </div>
            </main>
          </div>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </div>
      </div>
    );
  }
}

export default Home;
