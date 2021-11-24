/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package card;

import dashboard.Balances;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Enumeration;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author danielo
 */
public class CardServlet extends HttpServlet
{
  @Override
  protected void doGet( HttpServletRequest req, HttpServletResponse resp ) throws ServletException, IOException {
	Enumeration<String> paramNames = req.getParameterNames();
	String sAction = req.getParameter( "Action" );
	if ( sAction != null ) {
	    if ( sAction.equals( "Data" ) ) {
        String sDriver = req.getParameter( "Driver" );
DriverData dd = new CardData().getDriverData( Integer.parseInt( sDriver ) );
String sRaceName = new CardData().getRaceData();
	
	  	 String sJson = " { \"race\": \"" + sRaceName + " Grand Prix Winner\" , \"description\": \""
	  		 + "Championship Position: " + dd.position + getPositionSuffix( Integer.parseInt( dd.position ) ) + 
	  		 ", Points: " + dd.points + ", Wins: " + dd.wins + "\" }"; 
		 
	  	StringBuffer sb = new StringBuffer();
			
	  	for ( int i =0; i < sRaceName.length(); i++ ) {
	 	    sb.append( (int) sRaceName.charAt( i ) ).append( '.' );
	  	} 
		 
	  	resp.addHeader("Access-Control-Allow-Origin", "*" );

	  	PrintWriter out = resp.getWriter();
	  	out.print( sJson );
	  	out.flush();
	} else if ( sAction.equals( "Image" ) ) {
      String sDriver = req.getParameter( "Driver" );
      System.out.println( "url " + req.getQueryString() );
	    DriverData dd = new CardData().getDriverData( Integer.parseInt( sDriver ) );
	    String sRaceName = new CardData().getRaceData();
	try {
        String sFont = "Syncopate";
        BufferedImage image = ImageIO.read( new URL( "http://localhost:8080/" + getDriverCard( sDriver ) ) );
        Graphics g = image.getGraphics();
        Graphics2D g2 = (Graphics2D)g;
        RenderingHints rh = new RenderingHints(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2.setRenderingHints(rh);
        g.setColor(Color.RED);
        g.setFont(new Font( "Box", Font.BOLD, 26));
        g.drawString(sRaceName, 52, 60);
        g.setColor(Color.WHITE);
        g.setFont(new Font(sFont, Font.BOLD, 48));
        g.drawString( dd.wins, 620 + getWinsOffest( dd.wins ) , 1090);
        g.setFont(new Font(sFont, Font.BOLD, 40));
        Font currentFont = g.getFont();
        Font newFont = currentFont.deriveFont(currentFont.getSize() * 2.8F);
        g.setFont(newFont);
        g.drawString( dd.position, 110, 1040);
        g.setFont(new Font(sFont, Font.BOLD, 40 ));
        Font newFont2 = currentFont.deriveFont(currentFont.getSize() * 1.5F);
        g.setFont(newFont2);
        g.drawString( getPositionSuffix(Integer.parseInt(dd.position)), 160 + getPositionSuffixOffset( Integer.parseInt( dd.position ) ), 1004);
        g.setFont(new Font(sFont, Font.BOLD, 40));
        Font newFont3 = currentFont.deriveFont(currentFont.getSize() * 1.5F);
        g.setFont(newFont3);
        g.drawString( dd.points , 470 + getPointsOffest( dd.points ), 975 );
        g.dispose();
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType( "image/png" );
        resp.setHeader("Content-disposition", " filename=sample" + sDriver + ".png");
        ImageIO.write( image, "png", resp.getOutputStream() );
        resp.flushBuffer();
      } catch (MalformedURLException ex) {
      Logger.getLogger(CardMaker.class.getName()).log(Level.SEVERE, null, ex);
       }
    } 
	}
    }
    
    public String getDriverCard( String sNumber ) {
	int number = Integer.parseInt( sNumber );
	 switch (number) {
   case 33:
   return "max.png";    
   case 44:
   return "lewis2.png";
        }
        return "max.png";
    }
    
    public int getWinsOffest( String wins ) { //Not handling 10th yet, could happen at the beginning of a season.
	int iDigits = wins.length();
	
        switch (iDigits) {
   case 1:
   return 30;    
   case 2:
   return 0;
        }
        return 0;
    }
    
    
    public int getPointsOffest( String points ) { //Not handling 10th yet, could happen at the beginning of a season.
	int iDigits = points.length();
	
        switch (iDigits) {
   case 1:
   return 120;    
   case 2:
   return 90;
   case 3:
   return 80;
        }
        return 30;
    }
    
    public int getPositionSuffixOffset( int position ) { //Not handling 10th yet, could happen at the beginning of a season.
       
        switch (position) {
   case 1:
   return 0;    
   case 2:
   return 35;
   case 3:
   return 35;

        }
        return 35;
    }
    
    public String getPositionSuffix( int position ) {
       
  switch (position) {
   case 1:
   return "st";    
   case 2:
   return "nd";
   case 3:
   return "rd";
  }
  return "th";
 }
	
}

class CardData {
    
    public CardData() {
		
    }
    	
    public DriverData getDriverData( int iDriverNumber ) throws IOException {
        String sJson = "";
	    CloseableHttpClient httpclient = HttpClients.createDefault();
	    try {
       HttpGet httpget;
       httpget = new HttpGet( "https://ergast.com/api/f1/current/driverStandings.json" );

  		CloseableHttpResponse response = null;
  		try {
        response = httpclient.execute( httpget );
        HttpEntity entity = response.getEntity();
        if (entity != null) {
    			String result = EntityUtils.toString(entity);
          sJson = result;
        }
		} catch ( IOException ex ) {
        Logger.getLogger( Balances.class.getName() ).log( Level.SEVERE, null, ex );
		}finally {
        response.close();
		}
    } catch ( Exception e ) {
  		System.out.println( "error in httpclient " + e.getMessage() );
   } finally {
		httpclient.close();
	    }
		DriverData dd = null;	
		long lTime = 0;
		try {
			JSONObject jo = new JSONObject( sJson );
			JSONObject dataObject	    = jo.getJSONObject( "MRData" );
			JSONObject tableObject	    = dataObject.getJSONObject( "StandingsTable" );
			JSONArray StandingsLists    = tableObject.getJSONArray( "StandingsLists" );
			JSONObject StandingsObject  = StandingsLists.getJSONObject( 0 );
			JSONArray DriverStandings   = StandingsObject.getJSONArray( "DriverStandings" );
      
			for( int i = 0; i < DriverStandings.length(); i++ ) {   
 try {
     JSONObject positionObject = DriverStandings.getJSONObject( i );
     JSONObject driver = positionObject.getJSONObject( "Driver" );
     if ( iDriverNumber == Integer.parseInt( driver.getString( "permanentNumber" ) ) ) {
      dd= new DriverData( positionObject.getString( "position" ), positionObject.getString( "points" ), positionObject.getString( "wins" ) );
     }
 }
 catch ( Exception e ) {
     System.out.println( " " + e.getMessage() );
 }
			}
  } catch( Exception e ) {
			System.out.println( " " + e.getMessage() );
  }
       return dd;
	}
    
    public String replaceChars( String sName ) {
	String sNewName = "";
	StringBuffer sb =new StringBuffer();
	for ( int i = 0; i < sName.length(); i++ ) {
	    if ( sName.charAt( i ) == 227 ) {
		sb.append( 'a' ); 
	    }
	    else {
		sb.append( sName.charAt( i ) );
	    }
	}
	return sb.toString();
    }
    
    
    public String addSpaces( String sName ) {
	    String sNewName = "";
	    for ( int i = 0; i < sName.length(); i++ ) {
	        sNewName += sName.charAt( i ) + " ";
	    }
	    return sNewName;
    }
    
     public String getRaceData() throws IOException {
      String sJson = "";
	    String sRaceName = "";
	    CloseableHttpClient httpclient = HttpClients.createDefault();
	    try {
       HttpGet httpget;
       httpget = new HttpGet( "https://ergast.com/api/f1/current/last/results.json" );
    	CloseableHttpResponse response = null;
		  try {
        response = httpclient.execute( httpget );
        HttpEntity entity = response.getEntity();
      if (entity != null) {
  			String result = EntityUtils.toString(entity);
  			sJson = result;
      }
		} catch ( IOException ex ) {
Logger.getLogger( Balances.class.getName() ).log( Level.SEVERE, null, ex );
		}finally {
response.close();
		}
	    } catch ( Exception e ) {
		System.out.println( "error in httpclient " + e.getMessage() );
   } finally {
		httpclient.close();
	    }
		DriverData dd = null;	
		long lTime = 0;
		try {
			JSONObject jo = new JSONObject( sJson );
			JSONObject dataObject	    = jo.getJSONObject( "MRData" );
			JSONObject tableObject	    = dataObject.getJSONObject( "RaceTable" );
			JSONArray Races    = tableObject.getJSONArray( "Races" );
			JSONObject RaceObject  = Races.getJSONObject( 0 );
			sRaceName = RaceObject.getString( "raceName" ).replace( "Grand Prix", "" );

  } catch( Exception e ) {
			System.out.println( " " + e.getMessage() );
  }
       return addSpaces( replaceChars( sRaceName ) );
	}
}

class DriverData {
    
    public String position;
    public String points;
    public String wins;
    
    public DriverData( String position, String points, String wins ) {
        this.position = position;
        this.points = points;
        this.wins = wins;
    }
}
