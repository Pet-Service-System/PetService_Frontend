
const Banner = () => {
    return (
      <div>
          <div className="w3ls-banner about-w3lsbanner">
		<div className="w3lsbanner-info">
			<div className="header">
			<div className="container">   
                      <div className="agile_header_grid"> 
                          <div className="header-mdl agileits-logo">
                              <h1><a href="index.html">Pet Service</a></h1> 
                          </div>
                          <div className="agileits_w3layouts_sign_in">
                              <ul>
                              <li><a href="../Login" className="play-icon">ĐĂNG NHẬP</a></li>
                                  
                              </ul>
                          </div>
                          <div className="clearfix"> </div>
                      </div> 
                      <div className="header-nav">	
                          <nav className="navbar navbar-default">
                              <div className="navbar-header">
                                  <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                                      <span className="sr-only">Toggle navigation</span>
                                      <span className="icon-bar"></span>
                                      <span className="icon-bar"></span>
                                      <span className="icon-bar"></span>
                                  </button> 
                              </div>
                              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                  <ul className="nav navbar-nav cl-effect-16">
                                      <li><a href="index.html">TRANG CHỦ</a></li>
                                      <li><a href="about.html">GIỚI THIỆU</a></li> 
                                      <li><a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">DỊCH VỤ <span className="caret"></span></a>
                                          <ul className="dropdown-menu">
                                              <li><a href="icons.html">KHÁCH SẠN THÚ CƯNG</a></li>
                                              <li><a href="codes.html">DỊCH VỤ THÚ CƯNG</a></li>
                                          </ul>
                                      </li> 
                                      <li><a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">CỬA HÀNG <span className="caret"></span></a>
                                          <ul className="dropdown-menu">
                                              <li><a href="icons.html">DÀNH CHO CHÓ</a></li>
                                              <li><a href="codes.html">DÀNH CHO MÈO</a></li>
                                          </ul>
                                      </li> 
                                      <li><a href="contact.html" className="active">LIÊN HỆ</a></li>
                                  </ul>  
                                  <div className="clearfix"> </div>	
                              </div>
                          </nav>    
                      </div>	
                  </div>
			</div>	
		</div>	
	</div>	
      </div>
    )
  }
  
  export default Banner