import React from 'react'
import '/src/App.css'
import Key from '/src/components/Key.jsx'
import Language from '/src/components/Language.jsx'
import { languages } from '/src/languages.js'
import clsx from 'clsx'
import { getRandomWord, getFarewellText } from "/src/utils.js"
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export default function App() {
  
  const { width, height } = useWindowSize();

  // State values
  const [currentWord, setCurrentWord] = React.useState(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = React.useState([]);

  // Derived values
  const wrongGuessCount = guessedLetters.filter((character) => !currentWord.includes(character)).length;
  const isGameWon = 
    currentWord.split('').every(letter => guessedLetters.includes(letter));
  const isGameLost = wrongGuessCount >= languages.length - 1;
  const isGameOver = isGameWon || isGameLost;
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  // Derived elements
  const currentWordArray = currentWord.split('');
  const currentWordElements = currentWordArray.map((character, index) => {
    return <span className={isGameOver && (!guessedLetters.includes(character)) ? "not-guessed" : ""} key={index}>
      {isGameOver || guessedLetters.includes(character) ? character : ''}
    </span>
  })

  const languageElements = languages.map((language, index) => {
    return <Language 
      key={language.name}
      name={language.name}
      color={language.color}
      className={index < wrongGuessCount ? "lost" : "not-lost"}
      backgroundColor={language.backgroundColor}
    />
  })

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const keyElements = alphabet.map(character => {
    const isGuessed = guessedLetters.includes(character);
    const isCorrect = isGuessed && currentWord.includes(character);
    const isWrong = isGuessed && !currentWord.includes(character);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
      notGuessed: !isGuessed,
    })
    return <Key
      key={character}
      className={className}
      letter={character}
      isDisabled={isGameOver}
      isAriaDisabled={guessedLetters.includes(character)}
      handleClick={() => click(character)}
    />
  })
  
  function click(character) {
    setGuessedLetters(prev => 
      prev.includes(character) ? prev : [...prev, character] 
    );
  }

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lose: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect
  })

  
  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return <p className="farewell-message">
        {getFarewellText(languages[wrongGuessCount-1].name)}
        </p>

    }

    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      )
    } else if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      )
    }

    else {
      return null;
    }
  }

  function resetGame() {
    setCurrentWord(getRandomWord);
    setGuessedLetters([]);
  }

  return (
    <main>
      { isGameWon && <Confetti
        width={width}
        height={height}
        recycle={false}
      /> }
      <header>
        <h1>Assembly: Endgame</h1>
        <p>Guess the word in under 8 attemps to keep the programming world safe from Assembly!</p>
      </header>

      <section 
        aria-live="polite" 
        role="status" 
        className={gameStatusClass}
      >
        {renderGameStatus()}
      </section>

      <section className="language-bar">
        {languageElements}
      </section>

      <section className="current-word">
        {currentWordElements}
      </section>

      <section className="sr-only"
        aria-live="polite"
        role="status"
      >
        <p>
          {currentWord.includes(lastGuessedLetter) ? 
            `Correct! The letter ${lastGuessedLetter} is in the word.` : 
            `Sorry, the letter ${lastGuessedLetter} is not in the word.`
          }
          You have {languages.length - 1 - wrongGuessCount} attempts left.
        </p>
        <p>Current word: {currentWord.split("").map(letter => 
        guessedLetters.includes(letter) ? letter + "." : "blank.")
        .join(" ")}</p>
      </section>

      <section className="keyboard">
        {keyElements}
      </section>

      <section className="new-game">
        {isGameOver && <button onClick={resetGame}>New Game</button>}
      </section>
    </main>
  )
}