import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import moment from 'moment';

//mm:ss:cs
function Timer({ interval, style }: { interval: number; style: any }) {
  const pad = (number: number) => (number < 10 ? '0' + number : number); 
  const timeDuration = moment.duration(interval);
  const centiseconds = Math.floor(timeDuration.milliseconds() / 10); 

  return (
    <View style={styles.timerContainer}>
      <Text style={style}>{pad(timeDuration.minutes())}:</Text> {}
      <Text style={style}>{pad(timeDuration.seconds())},</Text> {}
      <Text style={style}>{pad(centiseconds)}</Text> {}
    </View>
  );
}

interface RoundButtonProps {
  buttonText: string; 
  buttonColor: string; 
  buttonBackground: string;
  onPress: () => void;
  disabled?: boolean;
}

function RoundButton({ buttonText, buttonColor, buttonBackground, onPress, disabled }: RoundButtonProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onPress()}
      style={[styles.button, { backgroundColor: buttonBackground }]}

      activeOpacity={disabled ? 1.0 : 0.7}>
      <View style={styles.buttonBorder}>
        <Text style={[styles.buttonTitle, { color: buttonColor }]}>{buttonText}</Text>
      </View>
    </TouchableOpacity>
  );
}


interface LapInfo {
  lapNumber: number;
  lapInterval: number;
  isFastest?: boolean; 
  isSlowest?: boolean; 
}

function Lap({ lapNumber, lapInterval, isFastest, isSlowest }: LapInfo) {
  const lapStyle = [styles.lapText, isFastest && styles.fastest, isSlowest && styles.slowest];
  return (
    <View style={styles.lap}>
      <Text style={lapStyle}>Lap {lapNumber}</Text>
      <Timer style={[lapStyle, styles.lapTimer]} interval={lapInterval} />
    </View>
  );
}


interface LapsTableProps {
  laps: number[];
  timer: number;
}

function LapsTable({ laps, timer }: LapsTableProps) {
  const finishedLaps = laps.slice(1);
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  if (finishedLaps.length >= 2) {
    finishedLaps.forEach(lap => {
      if (lap < min) min = lap;
      if (lap > max) max = lap;
    });
  }
  return (
    <ScrollView style={styles.scrollView}>
      {laps.map((lap, index) => (
        <Lap
        lapNumber={laps.length - index}
          key={laps.length - index}
          lapInterval={index === 0 ? timer + lap : lap}
          isFastest={lap === min}
          isSlowest={lap === max}
        />
      ))}
    </ScrollView>
  );
}

interface ButtonsRowProps {
  children: React.ReactNode;
}

function ButtonsRow({ children }: ButtonsRowProps) {
  return <View style={styles.buttonsRow}>{children}</View>;
}

interface StopwatchData {
  startTime: number; 
  now: number; 
  lapTimes: number[]; 
}

export default class App extends Component<{}, StopwatchData> {
  timer: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      startTime: 0,
      now: 0,
      lapTimes: [],
    };
  }


  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  start = () => {
    const now = new Date().getTime();
    this.setState({
      startTime: now,
      now,
      lapTimes: [0],
    });
    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() });
    }, 100);
  };

  lap = () => {
    const timestamp = new Date().getTime();
    const { lapTimes, now, startTime } = this.state;
    const [firstLap, ...other] = lapTimes;
    this.setState({
      lapTimes: [0, firstLap + now - startTime, ...other],
      startTime: timestamp,
      now: timestamp,
    });
  };

  stop = () => {
    if (this.timer) clearInterval(this.timer);
    const { lapTimes, now, startTime } = this.state;
    const [firstLap, ...other] = lapTimes;
    this.setState({
      lapTimes: [firstLap + now - startTime, ...other],
      startTime: 0,
      now: 0,
    });
  };

  reset = () => {
    this.setState({
      lapTimes: [],
      startTime: 0,
      now: 0,
    });
  };

  resume = () => {
    const now = new Date().getTime();
    this.setState({
      startTime: now,
      now,
    });
    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() });
    }, 100);
  };

  render() {
    const { now, startTime, lapTimes } = this.state;
    const timer = now - startTime;
    return (
      <View style={styles.container}>
        <Timer interval={lapTimes.reduce((total, curr) => total + curr, 0) + timer} style={styles.timer} />
        {lapTimes.length === 0 && (
          <ButtonsRow>
            <RoundButton buttonText='Lap' buttonColor='#8B8B90' buttonBackground='#151515' onPress={() => {}} disabled={true}  />
            <RoundButton buttonText='Start' buttonColor='#50D167' buttonBackground='#1B361F' onPress={this.start} />
          </ButtonsRow>
        )}
        {startTime > 0 && (
          <ButtonsRow>
            <RoundButton buttonText='Lap' buttonColor='white' buttonBackground='#3D3D3D' onPress={this.lap} />
            <RoundButton buttonText='Stop' buttonColor='#E33935' buttonBackground='#3C1715' onPress={this.stop} />
          </ButtonsRow>
        )}
        {lapTimes.length > 0 && startTime === 0 && (
          <ButtonsRow>
            <RoundButton buttonText='Reset' buttonColor='white' buttonBackground='#3D3D3D' onPress={this.reset} />
            <RoundButton buttonText='Start' buttonColor='#50D167' buttonBackground='#1B361F' onPress={this.resume} />
          </ButtonsRow>
        )}
        <LapsTable laps={lapTimes} timer={timer} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    paddingTop: 130,
    paddingHorizontal: 20,
  },
  timer: {
    color: 'white',
    fontSize: 76,
    fontWeight: '200',
    width: 110,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: 18,
  },
  buttonBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginTop: 80,
    marginBottom: 30,
  },
  lapText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  lapTimer: {
    width: 30,
  },
  lap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#151515',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  scrollView: {
    alignSelf: 'stretch',
  },
  fastest: {
    color: '#4BC05F',
  },
  slowest: {
    color: '#CC3531',
  },
  timerContainer: {
    flexDirection: 'row',
  },
});
