/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


// This file contains implementations for 
// Parser
// GLine
// Command
// ErrorParser


// A Parser takes raw line data and parse into commands for the simulator
CWS.Parser = function () 
  {
    this.glines = [];
    this.commands = [];
    this.activeCommand = null;
    this.feedMode = null;
    CWS.GLine.prototype.parser = this;
  }
// Returns the next command from the list
CWS.Parser.prototype.getCommand = function() 
  {
    return this.commands.shift();
  };
// Takes a line as a string and append a GLine to the array this.glines.
// If the line number is given the function will parse the line again.
// If the lineNumber is a null value the function will take as the last line
CWS.Parser.prototype.parseLine = function(line) 
  {
      var gline = new CWS.GLine(line);
      gline.lineNumber = this.glines.length+1;
      gline.processLine();
      this.glines.push(gline);  
  };
// Takes a code, split the lines and parse
CWS.Parser.prototype.parseCode = function(code) 
  {
    code=code.split("\n");
    for (var i = 0; i < code.length; i++) 
    {
      this.parseLine(code[i],null);
    }
  };
// A GLine contains all the parsed data from a line.
// A GLine should be created as follows:
// var gl = new CWS.GLine(raw_line_string);
// gl.lineNumber = lineNumber
// gl.processLine();
CWS.GLine = function (line) 
  {
    this.coments = [];
    this.lineNumber = 0;
    this.rawLine = line;
    this.activeCommand = null;
  }
// A raw line is processed by removing comments, spitting the line into words and numbers
// and separating and sorting all the commands in a line
// Final result will be in Parser.commands in the right order to be processed by the simulator.
CWS.GLine.prototype.processLine = function() 
  {
    var line = this.removeComment(this.rawLine);
    line = this.splitLine(line);
    try
    {
      this.separeteCommands(line);
    }
    catch (e)
    {
      console.log(e);
    }
    this.activeCommand = this.parser.activeCommand;
  };
// Lowercase the line and remove comments
CWS.GLine.prototype.removeComment = function(line) 
  {
    // A comment can be anything inside left and right parenthesis or anything after a semicolon
    var re = /(;.*)|(\([^)]*\))/g; 
    var m;
    
    while ((m = re.exec(line)) !== null) 
    {
      if (m.index === re.lastIndex) 
      {
          re.lastIndex++;
      }
      this.coments.push(m[1]);
    }
    // Remove comments,line numbers and spaces
    return line.toLowerCase().replace(re,"").replace(/\s/g,"").replace(/n\d*/,"");
  };
// Splits the line (string) into a vector containing pairs
// of characters and float numbers.
CWS.GLine.prototype.splitLine = function(line) 
  {
    var re = /([a-z])([+-]?\d*\.?\d*)/g; 
    var m;
    var result = [];
    while ((m = re.exec(line)) !== null) 
    {
      if (m.index === re.lastIndex) 
      {
          re.lastIndex++;
      }
      m[2]=parseFloat(m[2]);
      if (m[1]=='g' || m[1]=='m')
      {
        if (m[2]%1==0)
          m[2]=Math.round(m[2]);
        else
          m[2]=Math.round(m[2]*10);
      }
      result.push([m[1],m[2]]);
    }
    return result;
  };
// A line may contain more than one command for the machine.
// Here the line will be divided into multiple commands for the machine.
// If the line contains more than one command, they will be sorted using the following method
  // 0.     set feed rate mode (G93, G94 — inverse time or per minute).
  // 1.     set feed rate (F).
  // 2.     set spindle speed (S).
  // 3.     set temperature (M104).
  // 4.     change tool (M6).
  // 5.     spindle on or off (M3, M4, M5).
  // 6.     coolant on or off (M7, M8, M9).  wait for temperature (M109)
  // 7.     enable or disable overrides (M48, M49). extrusion mode (M82, M83)
  // 8.     dwell (G4).
  // 9.     set active plane (G17, G18, G19).
  // 10.    set length units (G20, G21).
  // 11.    cutter radius compensation on or off (G40, G41, G42)
  // 12.    cutter length compensation on or off (G43, G49)
  // 13.    coordinate system selection (G54, G55, G56, G57, G58, G59, G59.1, G59.2, G59.3).
  // 14.    set path control mode (G61, G61.1, G64)
  // 15.    set distance mode (G90, G91).
  // 16.    set retract mode (G98, G99).
  // 17.    home (G28, G30) or
  // 18.    change coordinate system data (G10)
  // 19.    set axis offsets (G92, G92.1, G92.2).
  // 20.    G53.
  // 21.    perform motion (G0 to G3, G80 to G89)
  // 21.    X,Y,Z,R,I,J,K
  // 22.    stop (M0, M1, M2, M30, M60).
  // 23.    Command not implemented
// Every command is an object of type Command
// If the G function takes parameters they will be inside the object Command
// A G code for motion (G0,G1,G2,G3) will only be added to the commands list if it has axis words
// If axis words appears alone a G function will be created with the current motion mode.
  // General functions and parameters
  // G0    X,Y,Z                   // G49     
  // G1    X,Y,Z                   // G53          
  // G2    X,Y,Z,R,I,J,K           // G54  
  // G3    X,Y,Z,R,I,J,K           // G55  
  // G4    P                       // G56  
  // G10   L,P,X,Y,Z,R,I,J,Q       // G57      
  // G17                           // G58  
  // G18                           // G59
  // G19                           // G61
  // G20                           // G64  
  // G21                           // G90  
  // G28   X,Y,Z                   // G91   
  // G30   X,Y,Z,P,H,S             // G92   X,Y,Z  
  // G40                           // G93        
  // G41   D                       // G94    
  // G42   D                       // G98   
  // G43   H                       // G99  
CWS.GLine.prototype.separeteCommands = function(line) 
  {
    // Get all the parameters
    var parametersList={};
    var commandsUnsorted=[]
    for (var i = 0; i < line.length; i++) 
    {
      elem=line[i];
      if (elem[0]=='g' || elem[0]=='m' || elem[0]=='f' || elem[0]=='s')
      {
        commandsUnsorted.push(elem);
      }
      else
      {
        parametersList[elem[0]]=elem[1];
      }
    };
    // Get all the commands
    ht=Array(24);
    for (var i = 0; i < commandsUnsorted.length; i++) 
    {
      var elem=commandsUnsorted[i];
      var c = new CWS.Command();
      c.ctype = elem[0];
      c.number = elem[1];
      switch(elem[0])
      {
        case 'g':
          switch (elem[1])
          {
            case 93: case 94:
              this.parser.feedMode = elem[1];
              c.mgroup=5;
              pos=0;
              break;
            case 4:
              if (!this.checkParameter(parametersList,c,'p'))
                throw new CWS.ErrorParser(this.lineNumber,"Wrong G4. Missing word P",this.rawLine);
              if (c.param['p']<0)
                throw new CWS.ErrorParser(this.lineNumber,"Wrong G4. P number must not be negative",this.rawLine);
              c.mgroup=0;
              pos=8;
              break;
            case 17: case 18: case 19:
              c.mgroup=2;
              pos=9;
              break;
            case 20: case 21:
              c.mgroup=6;
              pos=10;
              break;
            case 41: case 42:
              if (!this.checkParameter(parametersList,c,'d'))
                throw new CWS.ErrorParser(this.lineNumber,"Wrong G"+elem[1]+". Missing word D",this.rawLine);
            case 40: 
              c.mgroup=7;
              pos=11;
              break;
            case 43:
              if (!this.checkParameter(parametersList,c,'h'))
                throw new CWS.ErrorParser(this.lineNumber,"Wrong G43. Missing word H",this.rawLine);
            case 49:
              c.mgroup=8;
              pos=12;
              break;
            case 54: case 55: case 56: case 57: case 58: case 59:
              c.mgroup=12;
              pos=13;
              break;
            case 61: case 64:
              c.mgroup=13;
              pos=14;
              break;
            case 90: case 91:
              c.mgroup=3;
              pos=15;
              break;
            case 98: case 99:
              c.mgroup=10;
              pos=16;
              break;
            case 30:
              this.checkParameter(parametersList,c,'p');
              this.checkParameter(parametersList,c,'h');
            case 28:
              this.checkParameter(parametersList,c,'x');
              this.checkParameter(parametersList,c,'y');
              this.checkParameter(parametersList,c,'z');
              c.mgroup=0;
              pos=17;
              break;
            case 10:
              if (this.checkParameter(parametersList,c,'l'))
              {
                if (!this.checkParameter(parametersList,c,'p'))
                  throw new CWS.ErrorParser(this.lineNumber,"Wrong G10. Missing word P",this.rawLine);
                this.checkParameter(parametersList,c,'x');
                this.checkParameter(parametersList,c,'y');
                this.checkParameter(parametersList,c,'z');
                this.checkParameter(parametersList,c,'r');
                if (c.param['l']==1 || c.param['l']==10 || c.param['l']==11)
                {
                  this.checkParameter(parametersList,c,'i');
                  this.checkParameter(parametersList,c,'j');
                  this.checkParameter(parametersList,c,'q');
                }
              }
              else
                throw new CWS.ErrorParser(this.lineNumber,"Wrong G10. Missing word L",this.rawLine);
              c.mgroup=0;
              pos=18;
              break;
            case 92:
              var temp = false;
              temp = this.checkParameter(parametersList,c,'x')||temp;
              temp = this.checkParameter(parametersList,c,'y')||temp;
              temp = this.checkParameter(parametersList,c,'z')||temp;
              temp = this.checkParameter(parametersList,c,'e')||temp;
              if (temp==false)
                throw new CWS.ErrorParser(this.lineNumber,"Wrong G92. All axis words are omitted",this.rawLine);
              c.mgroup=0;
              pos=19;
              break;
            case 53:
              c.mgroup=0;
              pos=20;
              break;
            case 0: case 1: case 2: case 3:
              this.parser.activeCommand=c.number;
              c.mgroup=1;
              pos=21;
              break;
            default:
              c.number=9999;
              param=elem;
              pos=23;
              break;
          }
          break;
        // Miscellaneous function
        case 'm':
          switch (elem[1])
          {
            case 104:
              pos=3;
              break;
            case 6:
              c.mgroup=6;
              pos=4;
              break;
            case 3: case 4: case 5:
              c.mgroup=7;
              pos=5;
              break;
            case 7: case 8: case 9: case 109:
              c.mgroup=8;
              pos=6;
              break;
            case 48: case 49: case 82: case 83:
              c.mgroup=9;
              pos=7;
              break;
            case 0: case 1: case 2: case 30: case 60:
              c.mgroup=4;
              pos=22;
              break;
            default:
              c.number=9999;
              param=elem;
              pos=23;
              break;
          }
          break;
        // Feed rate
        case 'f':
          c.number=0;
          c.param['f']=elem[1];
          pos=1;
          break;
        // Spindle speed or temperature
        case 's':
          c.number=0;
          c.param['s']=elem[1];
          pos=2;
          break;
      }
      ht[pos]=c;
    }
    // Find axis words and generate a motion G code
    if (Object.keys(parametersList).length && this.parser.activeCommand!==null)
    {
      var temp = false;
      var temp2 = true;
      var c = new CWS.Command();
      temp = this.checkParameter(parametersList,c,'x')||temp;
      temp = this.checkParameter(parametersList,c,'y')||temp;
      temp = this.checkParameter(parametersList,c,'z')||temp;
      this.checkParameter(parametersList,c,'a');
      this.checkParameter(parametersList,c,'e');
      if (this.parser.activeCommand==2 || this.parser.activeCommand==3)
      {
        temp2 = false;
        temp2 = this.checkParameter(parametersList,c,'r')||temp2;
        temp2 = this.checkParameter(parametersList,c,'i')||temp2;
        temp2 = this.checkParameter(parametersList,c,'j')||temp2;
        temp2 = this.checkParameter(parametersList,c,'k')||temp2;
      }
      if (temp==true && temp2==true)
      {
        c.ctype = 'g';
        c.mgroup = 1;
        c.number = this.parser.activeCommand;
        // If G93 is active every line with G1,G2,G3 should have the F word 
        if (this.parser.feedMode==93 && c.number!=0 && ht[1]===undefined)
          throw new CWS.ErrorParser(this.lineNumber,"G93 is active but F word is missing",this.rawLine);
        ht[21]=c;
      }
      else
        ht[21]=undefined;
    }
    // Fill the commands vector with the commands already sorted
    for (var i = 0; i < ht.length; i++) 
    {
      if (ht[i]!==undefined)
      {
        ht[i].line = this;
        this.parser.commands.push(ht[i]);
      }
    }
  };
// Check whether the parameter exists.
// If it exists then it will be added to the command and deleted from the parameters list. Otherwise it returns false 
CWS.GLine.prototype.checkParameter = function(parametersList,c,parm) 
  {
    if (parm in parametersList)
    {
      if (/x|y|z/.test(parm))
        c.param.xyz[parm]=parametersList[parm];
      else if (/i|j|k/.test(parm))
        c.param.ijk[parm]=parametersList[parm];
      else
        c.param[parm]=parametersList[parm];
      delete parametersList[parm];
      return true;
    }
    else
      return false;
  };
// A Command can be any function that changes the state of the machine
// To be more specific a command is the smallest instruction that will be passed to the simulator.
// It contains the type and other data like parameters.
CWS.Command = function () 
  {
    // g,m,f,s
    this.ctype = null;
    // Modal groups
    this.mgroup = null;
    // g or m number
    this.number = null;
    // Parameters
    this.param = {ijk:{},xyz:{}}; 
    // A pointer to the line
    this.line = null;
  }
// Creates an error object for the parser
CWS.ErrorParser = function (line,message,data) 
  {
    this.line = line;
    this.message = message;
    this.data = data;
  };
// Returns a string form of the error.
CWS.ErrorParser.prototype.toString = function ()
  {
    return "Error on line: "+this.line
    throw "Error on line "+this.line+": "+this.message+"\n"+this.data;
  };