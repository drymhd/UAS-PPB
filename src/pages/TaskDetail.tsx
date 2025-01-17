import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonLabel,
  IonText,
  IonLoading,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonButton,
} from '@ionic/react';

type Task = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  image?: string;
};

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the ID from the URL
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // For showing loading spinner
  const [error, setError] = useState<string>(''); // Error message
  const history = useHistory(); // For navigating back

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        // Get the tasks from Preferences
        const { value } = await Preferences.get({ key: 'tasks' });
        if (value) {
          const tasks: Task[] = JSON.parse(value);
          const foundTask = tasks.find((task) => task.id.toString() === id);
          setTask(foundTask || null); // Set task if found, otherwise null
        }
      } catch (e) {
        setError('Terjadi kesalahan saat memuat tugas');
      } finally {
        setLoading(false); // Hide loading spinner when data is fetched
      }
    };

    fetchTaskDetail();
  }, [id]);



  if (error) {
    return (
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Kesalahan</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonText color="danger">{error}</IonText>
      </IonContent>
    );
  }

  if (!task) {
    return (
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Tugas Tidak Ditemukan</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonText>Tugas dengan ID {id} tidak ditemukan.</IonText>
      </IonContent>
    );
  }

  return (
    <IonContent>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detail Tugas</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Back Button */}
      <IonButton
        color="primary"
        onClick={() => history.goBack()}
        style={{ marginTop: '16px', marginLeft: '16px' }}
      >
        Kembali
      </IonButton>

      {/* Task Detail Section */}
      <IonGrid className="ion-padding">
        <IonRow>
          <IonCol size="12">
            <IonItem lines="none" style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', padding: '16px' }}>
              <IonLabel>
                <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '8px' }}>{task.title}</h2>
                <p style={{ fontSize: '1.1em', marginBottom: '12px' }}>{task.description}</p>
                <p>
                  <strong>Deadline:</strong> {task.deadline}
                </p>
                <p>
                  <strong>Prioritas:</strong> {task.priority}
                </p>
              </IonLabel>
            </IonItem>
          </IonCol>

          {/* Task Image */}
          {task.image && (
            <IonCol size="12">
              <IonImg
                src={task.image}
                alt="task"
                style={{
                  borderRadius: '8px',
                  marginTop: '16px',
                  width: '100%',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
            </IonCol>
          )}
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default TaskDetail;
