import { ImageBackground, StyleSheet, Text, View, SafeAreaView, TouchableOpacity,Image, Modal,Animated  } from 'react-native'
import React,{useState} from 'react'
import Data from '../Data/Questions'
import Icon from 'react-native-vector-icons/FontAwesome'
import CorrectSound from '../assets/audio/soundEffect/Correct.wav'
import WrongSound from '../assets/audio/soundEffect/Wrong.wav'
import { Audio } from "expo-av";

const Quiz = () => {

    const allquestions = Data;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showNextBtn, setShowNextBtn] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);   
    const [selectedOption, setSelectedOption] = useState(null); 
    const [disableOption, setDisableOption] = useState(false);    
    const [sound, setSound] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [score, setScore] = useState(0);
    const [showCorrectOption, setShowCorrectOption] = useState(false);
    const [correctOption, setCorrectOption] = useState(null);

    async function playSound(audioFile){
        const soundObject = new Audio.Sound();

        try{
            await soundObject.loadAsync(audioFile);
            await soundObject.playAsync();
        }catch(error){
            console.log('Error while playing audio:', error)
        }

        soundObject.setOnPlaybackStatusUpdate(async (status) => {
            if (status.didJustFinish) {
              await soundObject.unloadAsync();
            }
          });
    }

    async function playQuestionAudio(audioPath) {
        if (sound) {
            await sound.unloadAsync();
            setSound(undefined);
        }

        console.log("Loading Sound");
        const { sound: newSound } = await Audio.Sound.createAsync(audioPath);
        setSound(newSound);
    
        console.log("Playing Sound");
        await newSound.playAsync();
    }
   

    const renderQuestions =() =>{
        return(
            <View style={styles.questionContainer}>              
                <Text style={{color:'darkgray', fontSize:24}}>{currentQuestionIndex + 1} / {allquestions.length}</Text>        

                <Text style={{color:'white',fontSize:28,marginVertical:10, marginBottom:20}}>
                    {allquestions[currentQuestionIndex].question}
        
                    {allquestions[currentQuestionIndex].soundPath && (
                        (() => {
                            console.log(allquestions[currentQuestionIndex].soundPath);
                            return (
                                <TouchableOpacity
                                    onPress={()=>playQuestionAudio(allquestions[currentQuestionIndex].soundPath)}
                                    style={{
                                        width:40,
                                        height:40,
                                        marginLeft: 20,
                                    }}
                                >
                                    <Image source={require('../assets/background/audiobuttonlarge.png')}
                                        style={{ width: 40, height: 40, marginTop:5, marginLeft:20}} />
                                </TouchableOpacity>
                            );
                        })()
                    )}       
                </Text>
                    
            </View>          
        );
    }

    const renderOptions =() =>{
        return(
            <View style={{}}>
                {
                    allquestions[currentQuestionIndex].options.map(option => 
                    (
                        <TouchableOpacity 
                            key={option}
                            disabled={disableOption}
                            style={{
                                borderWidth:3,
                                borderColor:showCorrectOption && option === correctOption
                                ? "#32a852"
                                : isCorrect && selectedOption === option
                                ? "#32a852"
                                : selectedOption === option
                                ? "#ad1717"
                                : "#224670",
                                backgroundColor:'#0b284a',
                                marginHorizontal:'3%',
                                marginVertical:10,
                                borderRadius:22,
                                height:65,justifyContent:'center'
                            }}   
                            onPress={()=>handelselectedOption(option)}               
                        >  
                    
                            <View style={{flexDirection:'row',alignContent:'center',}}>
                                <Text style={{color:'white',
                                              marginLeft:'3%',
                                              fontSize:25,
                                              marginVertical:10,
                                              flex:1
                                }}>
                                    
                                    {option}
                                </Text>
                            
                                {   showCorrectOption && option === correctOption?

                                    (<Icon name="check" size={30} color="#11b86f" style={{alignSelf:'center',flex:1}} />) 
                                    :
                                    isCorrect && selectedOption === option ? 
                                    
                                    (<Icon name="check" size={30} color="#11b86f" style={{alignSelf:'center',flex:1}} />) 
                                    :

                                    !isCorrect && selectedOption == option ?

                                    (<Icon name="close" size={30} color="#ad1717" style={{alignSelf:'center',flex:1}} />  )
                                    : null                          
                                }

                            

                            </View>                            
                                                  
                        </TouchableOpacity>
                    ))
                }
            </View>   
        );
      
    }

    const handelselectedOption=(option)=>{

        setCorrectOption( allquestions[currentQuestionIndex].correctOption );
        setSelectedOption(option);
        
        console.log('option:', option);
        console.log('Selected option:', selectedOption)
        console.log('Correct option:', allquestions[currentQuestionIndex].correctOption);

        if(option === allquestions[currentQuestionIndex].correctOption){
            playSound(CorrectSound);    
            setScore(score+1);
            setShowNextBtn(true);
            setIsCorrect(true);
            setDisableOption(true); 
        }       
        else{
            playSound(WrongSound);     
            setShowCorrectOption(true);
            setDisableOption(true); 
            setIsCorrect(false);
            setShowNextBtn(true);
            // return null;        
        }      
    }

    const getNextBtn =()=>{
       if(showNextBtn ){
                return(
                    <TouchableOpacity
                        onPress={handelNextButton}
                        style={styles.nextButton}           
                    >
                        <Text style={{fontSize:20,color:'#2b2382'}}>Next</Text>
                    </TouchableOpacity>
                );
            }          
        else{
            return(
                null
            );
        }
    }

    const handelNextButton=()=>{  
            Animated.timing(progress,{
                toValue:currentQuestionIndex+1,
                duration:1000,
                useNativeDriver:false,
            }).start();
            
            if(currentQuestionIndex != allquestions.length-1){
                setCurrentQuestionIndex(currentQuestionIndex+1);             
            }else{
                setShowModal(true);                                                                                                                                                                   
            }
            
            setDisableOption(false);
            setShowNextBtn(false);  
            setSelectedOption(null);
    }

    const restartQuiz=()=>{
        setDisableOption(false);
        setShowNextBtn(false);  
        setSelectedOption(null);
        setScore(0);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setShowModal(false);
        setShowCorrectOption(false);

        Animated.timing(progress,{
            toValue: 0,
            duration:1000,
            useNativeDriver:false,
        }).start();
    }

    const [progress, setProgress] = useState(new Animated.Value(0));
    const progressAnim = progress.interpolate({
        inputRange: [0, allquestions.length],
        outputRange: ['0%','100%']
    })

    const renderProgressBar = () => {
        return (
            <View style={{
                width: '93%',
                alignSelf:'center',
                height: 20,
                borderRadius: 20,
                marginTop:'15%',
                backgroundColor: '#00000020',

            }}>
                <Animated.View style={[{
                    height: 20,
                    borderRadius: 20,
                    backgroundColor: '#3b6ebf'
                },{
                    width: progressAnim
                }]}>

                </Animated.View>

            </View>
        )
    }
    
    const renderScore = () =>{
        return(
            <View style={{justifyContent:'flex-end',  flexDirection:'row' ,marginTop:30}}>
                
                 <Text style={{fontSize:25, color:'darkgray'}}>Score:</Text>
                 <Text style={{fontSize:25, color:'darkgray'}}> {score} / {allquestions.length} </Text>
            </View>
           
        );
    }


  return (
    <View style={styles.container}>
        
        <ImageBackground source={require('../assets/background/bkg.jpeg')}
            style={styles.bkg} >
        <Text style={{marginTop:40,alignSelf:'center', color:'white', fontSize:30}}>Quiz App </Text>  

        {/* Process bar */}
        {renderProgressBar()}

        {/* Score */}
        {renderScore()}

        {/* Question */}
        {renderQuestions()}

        {/* Options */}
        {renderOptions()}
 
        {/* Next button */}   
        {getNextBtn()}

        {/* Score Modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
        >
            <View style={{
                       flex: 1,
                       backgroundColor: '#011338',
                       alignItems: 'center',
                       justifyContent: 'center',        
                       opacity:1
                   }}>
                
                <View style={{
                           backgroundColor: 'white',
                           width: '80%',
                           borderRadius: 20,
                           padding: 20,
                           alignItems: 'center'
                       }}>

                        <Text style={{fontSize: 30, fontWeight: 'bold', color:'#000'}}>{ score > (allquestions.length/2) ? 'Congratulations!' : 'Oops!' }</Text>

                        <Text style={{fontSize:25, color:'darkgray',marginTop:20,}}> {score} / {allquestions.length} </Text>

                        <TouchableOpacity
                           onPress={restartQuiz}
                           style={{
                               backgroundColor: 'lightblue',
                               padding: 20, width: '100%', borderRadius: 20, marginTop:20,
                           }}>
                               <Text style={{
                                   textAlign: 'center', color: 'white', fontSize: 20
                               }}>Retry Quiz</Text>
                           </TouchableOpacity>
                   </View>
            </View>
        </Modal>  
      </ImageBackground>
    </View>     
  )
}

export default Quiz

const styles = StyleSheet.create({
    container:{
        flex:1
    },
    bkg:{
        height:'100%',
        width:'100%',
    },
    questionContainer:{
        marginTop:-30,
        marginLeft:'3%',

    },
    nextButton:{
        backgroundColor:'#1e97c7',
        width:'20%',
        height:'5%',
        alignSelf:'center',
        alignItems:'center',
        justifyContent:'center',
        marginTop:50,
        borderRadius:20
    }

})