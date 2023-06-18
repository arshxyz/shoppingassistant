import React, { useEffect, useState } from 'react';
import logo from '../../assets/img/logo.svg';
import { Configuration, OpenAIApi } from 'openai';
import './Popup.css';
import { prompt } from './prompt';

const Popup = () => {
  const [title, setTitle] = useState('');
  const [isShoppingSite, setIsShoppingSite] = useState(false);
  const [response, setResponse] = useState("null")
  const [showAltSearches, setShowAltSearches] = useState(false)
  const [loading, setLoading] = useState(true)
  const openLink = (url) => {
    chrome.tabs.create({url: url})
  }
  const aicomplete = async (title) => {
    const configuration = new Configuration({
      apiKey: "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",
    });
    const openai = new OpenAIApi(configuration);
    
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: prompt}, {role: "user", content: title}],
      temperature: 0.14
    });
    let res = chatCompletion.data.choices[0].message.content;
    console.log(res)
    const resjson = await JSON.parse(res)
    if (!resjson.sustainable) setShowAltSearches(true)
    setResponse(resjson);
    setLoading(false)

  }
  useEffect(() => {
    console.log("Getting tabs")
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var tab = tabs[0];
      setTitle(tab.title);
      let match = tab.url.match("amazon.in") && tab.url.match("dp");
      setIsShoppingSite(match);
      if (match) aicomplete(tab.title);
      // fdffdfdfdfddfdfd
    
  });
  }, [chrome.tabs])

  const Display = () => {
    return (
      <div className={`h-screen p-4 ${response.sustainable ? 'bg-green-300' : 'bg-red-300'}`}>
      {response.sustainable ?
          <div>Sustainable ✅</div>
          :
          <div>Not Sustainable ❌<br/><br/></div>
          }
        <div>Einstein tip: {response.tip} <br/><br/></div>
        {showAltSearches && (
          <AltLinks/>
        )}
        <SustainabilityConcerns/>
        </div>
    )
  }

  const Concern = (props) => (
    <div>{props.concernText}</div>
  )

  const SustainabilityConcerns = () => {
    return (
      <>
      <br/>
      <div>
        {response.sustainabilityConcerns.map((concernText) => (
          <Concern key={concernText} concernText={concernText}/>
        ))}
        </div>
      </>
    )
  }

  const Loader = () => {
    return <div className='p-4'>Product found! Loading...</div>
  }

  const AltLinks = () => {
    return (
      <>
      <div className='flex flex-col'>
        <h3 className='text-bold italic'>Try shopping for these instead:</h3>
      {response.alternativeSearchKeywords.map((value, index) => {
        return <a key={value} onClick={()=>(openLink(response.alternativeSearchLinks[index]))} className='text-blue-500' href={response.alternativeSearchLinks[index]}>{value}</a>
      })}
      </div>
      </>
    )
  }

  return (
    <div className={`bg-blue-200 h-screen`}>
      {isShoppingSite ? 
      <>
        {
          loading ?
          <Loader/>
          :
          <Display/>
        }
      </>
    :
        <div className='bg-yellow-200 h-full p-4'>No product found</div>
      }
    </div>
  );
};

export default Popup;
