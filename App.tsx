/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {
  faPaste,
  faPlane,
  faPowerOff,
  faSuitcase,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import axios from 'axios';
import {AppText} from 'components/AppText';
import React, {useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {Header, Icon} from 'react-native-elements';
import {ThemeContext, ThemeProvider} from './src/context/ThemeContext';
const App = () => {
  return (
    <ThemeProvider>
      <SafeAreaView style={{flex: 1}}>
        <Home />
      </SafeAreaView>
    </ThemeProvider>
  );
};
type IResponse = {
  Flightnr: string;
  Date: string;
  'Aircraft Type': string;
  Tail: string;
  Departure: string;
  Destination: string;
  Time_Depart: string;
  Time_Arrive: string;
  DutyID: 'FLT' | 'DO' | 'SBY' | 'OFD';
  DutyCode: 'FLIGHT' | 'OFF' | 'Standby' | 'LAYOVER';
  Captain: string;
  'First Officer': string;
  'Flight Attendant': string;
};
const groupByKey = (array: IResponse[], key: keyof IResponse) => {
  return array.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});
};
const Home = () => {
  const {theme} = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [activeDetail, setActive] = useState<IResponse>();
  const [showDetails, toggleDetails] = useState(false);
  const [data, setData] = useState<{[key: string]: IResponse[]}>({});
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = () => {
    axios
      .get('https://rosterbuster.aero/wp-content/uploads/dummy-response.json')
      .then(res => {
        const grouping = groupByKey(res.data, 'Date');
        setData(grouping);
        setLoading(false);
      })
      .catch(error => {
        console.log('error', error);
      });
  };
  const onRefresh = React.useCallback(() => {
    setLoading(true);
    fetchData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: loading ? 'center' : 'flex-start',
      }}>
      {!loading && (
        <Header
          centerComponent={<AppText type={['white']}>Schedule</AppText>}
        />
      )}
      {loading ? (
        <ActivityIndicator color={theme.blue} />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
          style={{flex: 1}}>
          {Object.keys(data).length > 0 ? (
            Object.keys(data).map((date, index) => {
              return (
                <View key={`${index}`}>
                  <View
                    style={{
                      backgroundColor: '#f1f1f1',
                      borderBottomWidth: 0.8,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                    }}>
                    <AppText type={['bold']}>{date}</AppText>
                  </View>
                  {data[date].map((schedule, idx) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setActive(schedule);
                          toggleDetails(true);
                        }}
                        activeOpacity={0.8}
                        key={`${index}-${idx}`}
                        style={{
                          flexDirection: 'row',
                          paddingHorizontal: '5%',
                          paddingVertical: '3%',
                          borderBottomWidth: 0.7,
                          backgroundColor: theme.cardBg,
                        }}>
                        <View style={{flex: 1, justifyContent: 'center'}}>
                          <FontAwesomeIcon
                            size={24}
                            icon={
                              schedule.DutyCode === 'FLIGHT'
                                ? faPlane
                                : schedule.DutyCode === 'LAYOVER'
                                ? faSuitcase
                                : schedule.DutyCode === 'OFF'
                                ? faPowerOff
                                : faPaste
                            }
                          />
                        </View>

                        <View style={{flex: 6}}>
                          <AppText type={['bold']}>
                            {schedule.DutyCode === 'FLIGHT'
                              ? `${schedule.Departure} - ${schedule.Destination}`
                              : schedule.DutyCode === 'LAYOVER'
                              ? 'Layover'
                              : schedule.DutyCode}
                          </AppText>
                          {schedule.DutyCode === 'FLIGHT' ? null : (
                            <AppText type={['grey']}>
                              {schedule.Destination}
                            </AppText>
                          )}
                        </View>
                        <View style={{justifyContent: 'flex-end'}}>
                          {schedule.DutyCode === 'Standby' && (
                            <AppText type={['small', 'grey']}>
                              Match Crew
                            </AppText>
                          )}
                          <AppText type={['red', 'small']}>
                            {`${schedule.Time_Depart} - ${schedule.Time_Arrive}`}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          ) : (
            <AppText>No data found</AppText>
          )}
        </ScrollView>
      )}
      <Modal
        onRequestClose={() => toggleDetails(false)}
        onDismiss={() => toggleDetails(false)}
        visible={showDetails}>
        <View style={{flex: 1}}>
          <Header
            leftComponent={
              <Icon
                onPress={() => toggleDetails(false)}
                name="chevron-left"
                color="white"
              />
            }
            centerComponent={
              <AppText type={['white']}>Schedule Details</AppText>
            }
          />
          <View style={{padding: 10}}>
            <DetailRow label="Duty Code" value={activeDetail?.DutyCode} />
            <DetailRow label="Duty Id" value={activeDetail?.DutyID} />
            <DetailRow label="Departure" value={activeDetail?.Departure} />
            <DetailRow label="Destination" value={activeDetail?.Destination} />
            {!!activeDetail?.Flightnr && activeDetail?.Flightnr?.length > 0 && (
              <DetailRow label="Flight No" value={activeDetail?.Flightnr} />
            )}
            {!!activeDetail?.Time_Depart &&
              activeDetail?.Time_Depart.length > 0 && (
                <DetailRow
                  label="Departure Time"
                  value={activeDetail?.Time_Depart}
                />
              )}
            {!!activeDetail?.Time_Arrive &&
              activeDetail?.Time_Arrive.length > 0 && (
                <DetailRow
                  label="Arrival Time"
                  value={activeDetail?.Time_Arrive}
                />
              )}
            {!!activeDetail?.Captain && activeDetail?.Captain.length > 0 && (
              <DetailRow label="Captain" value={activeDetail?.Captain} />
            )}
            {!!activeDetail?.['First Officer'] &&
              activeDetail?.['First Officer'].length > 0 && (
                <DetailRow
                  label="First Officer"
                  value={activeDetail?.['First Officer']}
                />
              )}
            {!!activeDetail?.['Flight Attendant'] &&
              activeDetail?.['Flight Attendant'].length > 0 && (
                <DetailRow
                  label="Flight Attendant"
                  value={activeDetail?.['Flight Attendant']}
                />
              )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
const DetailRow = (props: {label: string; value: string | undefined}) => {
  return (
    <View style={{flexDirection: 'row', marginVertical: 8}}>
      <View style={{flex: 5}}>
        <AppText type={['bold']}>{props.label}</AppText>
      </View>
      <View style={{flex: 5}}>
        <AppText>{props.value}</AppText>
      </View>
    </View>
  );
};
export default App;
