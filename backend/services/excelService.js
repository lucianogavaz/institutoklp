
import supabase from './supabaseClient.js';

// --- SALES (Ações Comerciais) ---

export const getSales = async () => {
    try {
        const { data, error } = await supabase
            .from('comercial_actions')
            .select('*')
            .order('data', { ascending: false });

        if (error) throw error;

        // Mapear de snake_case (banco) para camelCase (frontend)
        return data.map(item => ({
            id: item.id,
            data: item.data,
            nome: item.nome,
            fone: item.fone,
            acao: item.acao,
            origemCampanha: item.origem_campanha,
            orcamento: item.orcamento,
            canalVenda: item.canal_venda,
            statusAtendimento: item.status_atendimento,
            fechamento: item.fechamento,
            valor: item.valor,
            tipoProcedimento: item.tipo_procedimento,
            profissional: item.profissional,
            observacoes: item.observacoes,
        }));
    } catch (error) {
        console.error('Erro ao buscar vendas no Supabase:', error);
        throw error;
    }
};

export const saveSales = async (newData) => {
    try {
        // Preparar dados para o Supabase (snake_case)
        const supabaseData = newData.map(item => {
            const record = {
                data: item.data,
                nome: item.nome,
                fone: item.fone,
                acao: item.acao,
                origem_campanha: item.origemCampanha,
                orcamento: item.orcamento,
                canal_venda: item.canalVenda,
                status_atendimento: item.statusAtendimento,
                fechamento: item.fechamento,
                valor: item.valor,
                tipo_procedimento: item.tipoProcedimento,
                profissional: item.profissional,
                observacoes: item.observacoes,
            };

            // Se o ID não for 'new-', mantemos para atualização. 
            // Se for 'new-', removemos para o banco gerar um novo ID.
            if (item.id && !item.id.toString().startsWith('new-')) {
                record.id = item.id;
            }

            return record;
        });

        // Upsert no Supabase
        const { data, error } = await supabase
            .from('comercial_actions')
            .upsert(supabaseData, { onConflict: 'id' })
            .select();

        if (error) throw error;

        return { success: true, count: data.length };
    } catch (error) {
        console.error('Erro ao salvar vendas no Supabase:', error);
        throw error;
    }
};


// --- BIRTHDAYS (Aniversariantes) ---

export const getBirthdays = async () => {
    try {
        // Assumindo que a tabela se chama 'birthdays' ou 'aniversariantes'
        // Ajuste o nome da tabela conforme criado no Supabase
        const { data, error } = await supabase
            .from('birthdays')
            .select('*');

        if (error) {
            // Se a tabela não existir, retorna array vazio para não quebrar o app
            if (error.code === '42P01') {
                console.warn("Tabela 'birthdays' não encontrada no Supabase. Retornando lista vazia.");
                return [];
            }
            throw error;
        }

        // Mapear snake_case (banco) para PascalCase (frontend)
        return (data || []).map(item => ({
            key: item.id ? item.id.toString() : undefined,
            id: item.id,
            Nome: item.nome,
            DataNascimento: item.data_nascimento,
            Celular: item.celular
        }));
    } catch (error) {
        console.error('Erro ao buscar aniversariantes no Supabase:', error);
        return [];
    }
};

export const saveBirthdays = async (newData) => {
    try {
        // Mapear PascalCase (frontend) para snake_case (banco)
        const supabaseData = newData.map(item => {
            const record = {
                nome: item.Nome,
                data_nascimento: item.DataNascimento,
                celular: item.Celular
            };

            // Se tiver ID válido (não 'new-'), mantém
            if (item.id && !item.id.toString().startsWith('new-')) {
                record.id = item.id;
            }

            // Se tiver key que parece um ID numérico, usa
            if (item.key && !isNaN(item.key) && !item.id) {
                record.id = item.key;
            }

            return record;
        });

        const { data, error } = await supabase
            .from('birthdays')
            .upsert(supabaseData, { onConflict: 'id' })
            .select();

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Erro ao salvar aniversariantes no Supabase:', error);
        throw error;
    }
};

