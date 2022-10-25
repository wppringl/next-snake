import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  SimpleGrid,
  Stack,
  Button,
  Heading,
  Flex,
} from "@chakra-ui/react";

const backgroundColorMap = {
  cell: "transparent",
  snake: "green",
  snakeHead: "green", //"#73b173",
  //snakeBody: "green",
  //snakeTail: "#b4c7b4",
  fruit: "red",
};

const INITIAL_DIRECTION = "ArrowRight";
const INITIAL_IS_PLAYING = false;
const INITIAL_IS_Beat_Level = false;
const INITIAL_GAME_OVER = false;
const INITIAL_SNAKE = [0, 1, 2];
const INITIAL_SCORE = 0;
const INITIAL_TIME_DELAY = 1000;
const CELL_WIDTH = 50;
const INITIAL_HIGHSCORE = 0;
const INITIAL_LEVEL = 1;
const INITIAL_FRUIT_COUNT = 0;
let level = INITIAL_LEVEL;
let fruitCount = INITIAL_FRUIT_COUNT;

const levelFruitMap = {
  1: 8,
  2: 12,
  3: 18,
  4: 27,
};

const levelWidthMap = {
  1: 8,
  2: 10,
  3: 12,
  4: 15,
};

const directionMap = {
  ArrowRight: 1,
  ArrowLeft: -1,
  ArrowDown: levelWidthMap[level],
  ArrowUp: -levelWidthMap[level],
};

const borderColorMap = {
  true: "green",
  false: "red",
};

const createGameboard = () => {
  const gameboard = [];
  for (let i = 0; i < levelWidthMap[level] * levelWidthMap[level]; i++) {
    gameboard.push("cell");
  }
  INITIAL_SNAKE.forEach((snake) => (gameboard[snake] = "snake"));
  gameboard[INITIAL_SNAKE.length - 1] = "snakeHead";
  gameboard[12] = "fruit";
  return gameboard;
};

export default function Home() {
  const [gameboard, setGameboard] = useState(createGameboard());
  const [isPlaying, setIsPlaying] = useState(INITIAL_IS_PLAYING);
  const [isBeatLevel, setIsBeatLevel] = useState(INITIAL_IS_Beat_Level);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [gameOver, setGameOver] = useState(INITIAL_GAME_OVER);
  const [highScore, setHighScore] = useState(INITIAL_HIGHSCORE);
  const timeoutId = useRef();
  const score = useRef(INITIAL_SCORE);
  const time = useRef(INITIAL_TIME_DELAY);
  const previousDirection = useRef(INITIAL_DIRECTION);

  const handleKeydown = useCallback((evt) => {
    if (directionMap[evt.key]) {
      setDirection(evt.key);
    }
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    window.addEventListener("keydown", handleKeydown);
  };

  const startNextLevel = () => {
    if (levelWidthMap[level + 1]) {
      level += 1;
      directionMap["ArrowDown"] = levelWidthMap[level];
      directionMap["ArrowUp"] = -levelWidthMap[level];
    }
    fruitCount = 0;
    if (score.current > highScore) {
      setHighScore(score.current);
    }
    time.current = INITIAL_TIME_DELAY;
    clearTimeout(timeoutId.current);
    //setIsPlaying(INITIAL_IS_PLAYING);
    setGameboard(createGameboard());
    setDirection(INITIAL_DIRECTION);
    setSnake(INITIAL_SNAKE);
    setGameOver(INITIAL_GAME_OVER);
    setIsBeatLevel(INITIAL_IS_Beat_Level);
    previousDirection.current = INITIAL_DIRECTION;
    window.removeEventListener("keydown", handleKeydown);
  };

  const resetGame = () => {
    score.current = INITIAL_SCORE;
    time.current = INITIAL_TIME_DELAY;
    level = INITIAL_LEVEL;
    fruitCount = INITIAL_FRUIT_COUNT;
    clearTimeout(timeoutId.current);
    setIsPlaying(INITIAL_IS_PLAYING);
    setGameboard(createGameboard());
    setDirection(INITIAL_DIRECTION);
    setSnake(INITIAL_SNAKE);
    setGameOver(INITIAL_GAME_OVER);
    previousDirection.current = INITIAL_DIRECTION;
    directionMap["ArrowDown"] = levelWidthMap[level];
    directionMap["ArrowUp"] = -levelWidthMap[level];
    window.removeEventListener("keydown", handleKeydown);
  };

  const move = () => {
    previousDirection.current = direction;
    const tempGameboard = [...gameboard];
    const tempSnake = [...snake];
    const newHead = tempSnake[tempSnake.length - 1] + directionMap[direction];
    tempGameboard[tempSnake[tempSnake.length - 1]] = "snake";
    tempSnake.push(newHead);
    if (tempGameboard[newHead] !== "fruit") {
      const cell = tempSnake.shift();
      tempGameboard[cell] = "cell";
    } else {
      // this means that the snake has captured the fruit
      fruitCount += 1;
      score.current += 10;
      if (fruitCount >= levelFruitMap[level]) {
        setIsBeatLevel(true);
        setIsPlaying(false);
        setGameOver(true);
      } else {
        time.current = time.current <= 250 ? time.current : time.current - 75;
        tempGameboard[generateFruitIndex(tempSnake)] = "fruit";
      }
    }

    // game should be over if snake runs into itself
    if (tempSnake.indexOf(newHead) !== tempSnake.lastIndexOf(newHead)) {
      setGameOver(true);
      if (score.current > highScore) {
        setHighScore(score.current);
      }
    }

    // game over when snake crosses the border.
    if (direction === "ArrowRight" && newHead % levelWidthMap[level] === 0) {
      setGameOver(true);
      if (score.current > highScore) {
        setHighScore(score.current);
      }
      return;
    }

    if (
      direction === "ArrowLeft" &&
      (newHead + 1) % levelWidthMap[level] === 0
    ) {
      setGameOver(true);
      if (score.current > highScore) {
        setHighScore(score.current);
      }
      return;
    }

    if (direction === "ArrowUp" && newHead < 0) {
      setGameOver(true);
      if (score.current > highScore) {
        setHighScore(score.current);
      }
      return;
    }

    if (direction === "ArrowDown" && newHead >= gameboard.length) {
      setGameOver(true);
      if (score.current > highScore) {
        setHighScore(score.current);
      }
      return;
    }

    tempGameboard[newHead] = "snakeHead";
    setGameboard(tempGameboard);
    setSnake(tempSnake);
  };

  const generateFruitIndex = useCallback((tempSnake) => {
    let fruitIndex = Math.floor(Math.random() * gameboard.length);

    while (tempSnake.includes(fruitIndex)) {
      fruitIndex = Math.floor(Math.random() * gameboard.length);
    }
    return fruitIndex;
  }, []);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      if (direction !== previousDirection.current) {
        clearTimeout(timeoutId.current);
        move();
      } else {
        timeoutId.current = setTimeout(move, time.current);
      }
    }
  }, [snake, isPlaying, direction, gameOver]);

  return (
    <Stack alignItems="center" justifyContent="center" minHeight="100vh">
      <Heading color="blue">Retro Snake Game </Heading>
      <Heading> Game Level: {level} </Heading>
      <Flex alignItems="center">
        <SimpleGrid
          columns={levelWidthMap[level]}
          spacing={0}
          width={`${levelWidthMap[level] * CELL_WIDTH}px`}
          border="1px solid"
          borderColor={gameOver && borderColorMap[isBeatLevel]}
        >
          {gameboard.map((item, index) => (
            <Box
              width={`${CELL_WIDTH}px`}
              height={`${CELL_WIDTH}px`}
              background={backgroundColorMap[item]}
              borderTopRightRadius={
                item === "snakeHead" &&
                (direction === "ArrowRight" || direction === "ArrowUp") &&
                "50%"
              }
              borderBottomRightRadius={
                item === "snakeHead" &&
                (direction === "ArrowRight" || direction === "ArrowDown") &&
                "50%"
              }
              borderTopLeftRadius={
                item === "snakeHead" &&
                (direction === "ArrowLeft" || direction === "ArrowUp") &&
                "50%"
              }
              borderBottomLeftRadius={
                item === "snakeHead" &&
                (direction === "ArrowLeft" || direction === "ArrowDown") &&
                "50%"
              }
              borderRadius={item === "fruit" && "50%"}
              key={index}
            />
          ))}
        </SimpleGrid>
      </Flex>
      {!isPlaying && !isBeatLevel && (
        <Button size="lg" onClick={startGame}>
          Start
        </Button>
      )}
      {!isPlaying && isBeatLevel && (
        <Button size="lg" onClick={startNextLevel}>
          Start Next Level
        </Button>
      )}
      {isPlaying && (
        <Button size="lg" onClick={resetGame}>
          Reset
        </Button>
      )}
      <Flex alignContent="center">
        <Heading as="h3" size="lg">
          Score: {score.current} High Score: {highScore}
        </Heading>
      </Flex>
    </Stack>
  );
}
