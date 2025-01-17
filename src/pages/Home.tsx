import React, { useState, useEffect } from 'react';
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonIcon,
  useIonViewWillEnter,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonImg,
  IonToast,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
} from '@ionic/react';
import { addOutline, trashOutline, pencilOutline, cameraOutline } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

type Task = {
  id?: number;
  title: string;
  description: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  image?: string;
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task>({ title: '', description: '', deadline: '', priority: 'Medium', completed: false });
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async (): Promise<void> => {
    const { value } = await Preferences.get({ key: 'tasks' });
    if (value) {
      setTasks(JSON.parse(value));
    }
  };

  const saveTasks = async (tasks: Task[]): Promise<void> => {
    await Preferences.set({ key: 'tasks', value: JSON.stringify(tasks) });
    setToastMessage('Tugas berhasil disimpan');
  };

  const addOrEditTask = (): void => {
    if (currentTask.id) {
      const updatedTasks = tasks.map((t) => (t.id === currentTask.id ? currentTask : t));
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    } else {
      const newTask: Task = { ...currentTask, id: Date.now() };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);

      scheduleNotification(newTask);
    }
    setModalOpen(false);
    setCurrentTask({ title: '', description: '', deadline: '', priority: 'Medium', completed: false });
  };

  const deleteTask = (id: number): void => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setToastMessage('Tugas berhasil dihapus');
  };

  const scheduleNotification = async (task: Task): Promise<void> => {
    const deadlineDate = new Date(task.deadline);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: task.id!,
          title: `Pengingat untuk ${task.title}`,
          body: `Jangan lupa untuk menyelesaikan tugas!`,
          schedule: { at: deadlineDate },
        },
      ],
    });
  };

  const takePicture = async (): Promise<void> => {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
    });
    setCurrentTask({ ...currentTask, image: image.dataUrl });
    setToastMessage('Gambar berhasil ditambahkan');
  };

  const handleEditTask = (task: Task): void => {
    setCurrentTask(task);
    setModalOpen(true);
  };

  return (
    <IonApp>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manajer Tugas Pribadi</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonButton expand="full" onClick={() => setModalOpen(true)} style={{ borderRadius: '12px' }}>
          <IonIcon icon={addOutline} slot="start" /> Tambah Tugas
        </IonButton>

        <IonList>
          {tasks.map((task) => (
            <IonItemSliding key={task.id} style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <IonItem style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                <IonLabel>
                  <h2>{task.title}</h2>
                  <p>Deadline: {task.deadline}</p>
                  <p>Prioritas: {task.priority}</p>
                </IonLabel>
                {task.image && <IonImg src={task.image} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />}
              </IonItem>

              <IonItemOptions side="end">
                <IonItemOption color="primary" onClick={() => handleEditTask(task)} style={{ borderRadius: '12px' }}>
                  <IonIcon icon={pencilOutline} />
                  Edit
                </IonItemOption>
                <IonItemOption color="danger" onClick={() => deleteTask(task.id!)} style={{ borderRadius: '12px' }}>
                  <IonIcon icon={trashOutline} />
                  Hapus
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>

        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonContent>
            <IonHeader>
              <IonToolbar>
                <IonTitle>{currentTask.id ? 'Edit Tugas' : 'Tambah Tugas'}</IonTitle>
              </IonToolbar>
            </IonHeader>

            <IonItem>
              <IonLabel position="stacked">Judul</IonLabel>
              <IonInput
                value={currentTask.title}
                onIonChange={(e) => setCurrentTask({ ...currentTask, title: e.detail.value! })}
                style={{ borderRadius: '8px' }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Deskripsi</IonLabel>
              <IonTextarea
                value={currentTask.description}
                onIonChange={(e) => setCurrentTask({ ...currentTask, description: e.detail.value! })}
                style={{ borderRadius: '8px' }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Deadline</IonLabel>
              <IonDatetime
                value={currentTask.deadline}
                onIonChange={(e) => setCurrentTask({ ...currentTask, deadline: e.detail.value! })}
                style={{ borderRadius: '8px' }}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Prioritas</IonLabel>
              <IonSelect
                value={currentTask.priority}
                onIonChange={(e) => setCurrentTask({ ...currentTask, priority: e.detail.value! })}
                style={{ borderRadius: '8px' }}
              >
                <IonSelectOption value="High">Tinggi</IonSelectOption>
                <IonSelectOption value="Medium">Sedang</IonSelectOption>
                <IonSelectOption value="Low">Rendah</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonButton expand="full" onClick={takePicture} className="ion-margin" style={{ borderRadius: '12px' }}>
              <IonIcon icon={cameraOutline} slot="start" /> Ambil Gambar
            </IonButton>
            {currentTask.image && <IonImg src={currentTask.image} style={{ maxWidth: '100%', borderRadius: '12px' }} />}

            <IonButton expand="full" onClick={addOrEditTask} className="ion-margin" style={{ borderRadius: '12px' }}>
              Simpan Tugas
            </IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonApp>
  );
};

export default App;
