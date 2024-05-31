import { NavLink } from "react-router-dom"

const ContactPageBanner = () => {
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
                              <li><NavLink to="../Login" className="play-icon">ĐĂNG NHẬP</NavLink></li>
                                  
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
                                      <li><NavLink to="/">TRANG CHỦ</NavLink></li>
                                      <li><NavLink to="about">GIỚI THIỆU</NavLink></li> 
                                      <li><NavLink to="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">DỊCH VỤ <span className="caret"></span></NavLink>
                                          <ul className="dropdown-menu">
                                              <li><NavLink to="pet-hotel">KHÁCH SẠN THÚ CƯNG</NavLink></li>
                                              <li><NavLink to="pet-service">DỊCH VỤ THÚ CƯNG</NavLink></li>
                                          </ul>
                                      </li> 
                                      <li><NavLink to="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">CỬA HÀNG <span className="caret"></span></NavLink>
                                          <ul className="dropdown-menu">
                                              <li><NavLink to="for-dog">DÀNH CHO CHÓ</NavLink></li>
                                              <li><NavLink to="for-cat">DÀNH CHO MÈO</NavLink></li>
                                          </ul>
                                      </li> 
                                      <li><NavLink to="contact" className="active">LIÊN HỆ</NavLink></li>
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
  
  export default ContactPageBanner